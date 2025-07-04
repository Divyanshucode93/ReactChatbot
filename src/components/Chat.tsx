import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chat.css';
import * as pdfjsLib from 'pdfjs-dist';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import PPTXParser from 'pptx-parser';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const S3_BUCKET_URL = 'https://reactchatbotbucket.s3.amazonaws.com/';
const S3_FILES = ['Evolution_of_the_Internet_Detailed.pdf']; // Add more files here

// Remove the broken ?url import and use fake worker mode for local development
pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

// ---- File Parsers ----

const getTextFromPDF = async (url: string): Promise<string> => {
  // Fetch the PDF as ArrayBuffer to avoid CORS issues
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
};

const getTextFromCSV = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const csv = await response.text();
  const parsed = Papa.parse(csv, { header: false });
  return parsed.data.flat().join(' ');
};

const getTextFromXLSX = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let text = '';
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_csv(sheet);
    text += data + '\n';
  });
  return text;
};

const getTextFromDOCX = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const getTextFromPPTX = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const slides = await PPTXParser.parse(arrayBuffer);
  return slides.map((slide: any) => slide.text).join(' ');
};

const getTextFromTXT = async (url: string): Promise<string> => {
  const response = await fetch(url);
  return await response.text();
};

const getTextFromFile = async (url: string): Promise<string> => {
  if (url.endsWith('.pdf')) return getTextFromPDF(url);
  if (url.endsWith('.csv')) return getTextFromCSV(url);
  if (url.endsWith('.xlsx') || url.endsWith('.xls')) return getTextFromXLSX(url);
  if (url.endsWith('.docx')) return getTextFromDOCX(url);
  if (url.endsWith('.pptx') || url.endsWith('.ppt')) return getTextFromPPTX(url);
  if (url.endsWith('.txt')) return getTextFromTXT(url);
  return '';
};

// ---- Chat Component ----

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello!!!! How may I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      setLoading(true);
      let allText = '';
      for (const file of S3_FILES) {
        try {
          const url = S3_BUCKET_URL + file;
          const text = await getTextFromFile(url);
          allText += `\n[${file}]\n` + text;
        } catch (err) {
          console.error(`Error loading file ${file}:`, err);
          allText += `\n[${file}]\nFailed to load or parse file.`;
        }
      }
      setKnowledge(allText);
      setLoading(false);
    };
    loadKnowledgeBase();
  }, []);

  const findBestAnswer = (question: string, knowledge: string): string => {
    if (!knowledge) return 'Knowledge base is still loading.';
    // Split knowledge into paragraphs for more context
    const paragraphs = knowledge.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const questionWords = question.toLowerCase().split(/\W+/).filter(Boolean);
    let bestScore = 0;
    let bestParagraph = '';
    for (const paragraph of paragraphs) {
      const paragraphWords = paragraph.toLowerCase().split(/\W+/);
      const score = questionWords.filter(word => paragraphWords.includes(word)).length;
      if (score > bestScore) {
        bestScore = score;
        bestParagraph = paragraph;
      }
    }
    if (bestScore === 0) return "I'm sorry, I couldn't find an answer to your question in my knowledge base.";
    // Try to rephrase in a more human way
    return `Here's what I found: ${bestParagraph}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMessage: Message = { text: inputText, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    setTimeout(() => {
      let botText = findBestAnswer(inputText, knowledge);
      setMessages(prev => [...prev, { text: botText, sender: 'bot' }]);
    }, 1000);
  };

  return (
    <Container className="chat-container">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="chat-box">
            <div className="chat-messages">
              {loading ? (
                <div className="message bot-message">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Loading knowledge base from S3 bucket...
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                  >
                    {message.text}
                  </div>
                ))
              )}
            </div>
            <Form onSubmit={handleSubmit} className="message-form">
              <Form.Group className="d-flex">
                <Form.Control
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                  disabled={loading}
                />
                <Button type="submit" variant="primary" className="send-button" disabled={loading}>
                  Send
                </Button>
              </Form.Group>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
