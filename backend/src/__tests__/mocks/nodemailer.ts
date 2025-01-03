const mockTransporter = {
  sendMail: jest.fn().mockImplementation(() => Promise.resolve({
    messageId: 'test-message-id'
  }))
};

export default {
  createTransport: jest.fn().mockReturnValue(mockTransporter)
}; 