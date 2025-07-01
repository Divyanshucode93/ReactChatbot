import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Chat.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const newUserMessage: Message = { text: inputText, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        text: 'This is a sample response. In a real application, you would integrate with a backend or AI service.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputText('');
  };

  return (
    <Container className="chat-container">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="chat-box">
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <Form onSubmit={handleSubmit} className="message-form">
              <Form.Group className="d-flex">
                <Form.Control
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                />
                <Button type="submit" variant="primary" className="send-button">
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
