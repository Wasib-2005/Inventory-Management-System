let clients = [];

const todaySalesSse = {
  // Add a new active connection
  addClient(res) {
    clients.push(res);
  },

  // Remove client when they close the tab
  removeClient(res) {
    clients = clients.filter((client) => client !== res);
  },

  // Get active user count
  getClientCount() {
    return clients.length;
  },

  // Broadcast
  broadcast(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    
    clients.forEach((client) => {
      client.write(payload);
    });
  },
};


export default todaySalesSse