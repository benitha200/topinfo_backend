import fetch from 'node-fetch';

export const smsService = {
  async login() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "email": "ahupanet@gmail.com",
      "password": "Kigali@123"
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    try {
      const response = await fetch("https://call-afric-aaba9bbf4c5c.herokuapp.com/api/auth/login", requestOptions);
      const result = await response.json();
      return result.data.token;
    } catch (error) {
      console.error("Error getting SMS token:", error);
      throw new Error("Failed to authenticate with SMS service");
    }
  },

  async sendSMS(phoneNumber, message) {
    try {
      const token = await this.login();
      
      const myHeaders = new Headers();
      myHeaders.append("Authorization", token);
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "phoneNumber": phoneNumber,
        "message": message,
        "sender": "callafrica"
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      const response = await fetch("https://call-afric-aaba9bbf4c5c.herokuapp.com/api/sendSms", requestOptions);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new Error("Failed to send SMS");
    }
  }
};