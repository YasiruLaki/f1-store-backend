const connectToDB = require('./connectToDB');
const Newsletter = require('../models/Newsletter');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure your email service (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, 
});

// Function to send confirmation email
const sendConfirmationEmail = async (email) => {
  const mailOptions = {
    from: 'admin@pitlaneperformances.com',
    to: email,
    subject: 'Welcome to Our Newsletter!',
    html: `
<!doctype html>
<html>
  <body>
    <div
      style='background-color:#F2F5F7;color:#242424;font-family:Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF;border-radius:0"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="font-weight:normal;padding:0px 24px 16px 24px"></div>
              <div style="font-size:16px;padding:16px 24px 16px 24px">
                <!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta
                      name="viewport"
                      content="width=device-width, initial-scale=1.0"
                    />
                    <title>Welcome to Our Newsletter</title>
                    <style>
                      body {
                          margin: 0;
                          padding: 0;
                          background-color: #f2f2f2;
                          font-family: Arial, sans-serif;
                          color: #333;
                      }
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          background-color: #ffffff;
                          border-radius: 8px;
                          overflow: hidden;
                          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                      }
                      .header {
                          background-color: #111111;
                          padding: 20px;
                          text-align: center;
                      }
                      .header h1 {
                          color: #ffffff;
                          margin: 0;
                          font-size: 24px;
                          font-weight: bold;
                      }
                      .hero {
                          padding: 20px;
                          text-align: center;
                          background-color: #f8f8f8;
                      }
                      .hero img {
                          max-width: 100%;
                          height: auto;
                          border-radius: 8px;
                      }
                      .content {
                          padding: 20px;
                          color: #555;
                      }
                      .content h2 {
                          color: #111111;
                          font-size: 20px;
                          font-weight: bold;
                          margin-bottom: 10px;
                      }
                      .content p {
                          font-size: 16px;
                          line-height: 1.5;
                          margin-bottom: 20px;
                      }
                      .cta-button {
                          display: inline-block;
                          padding: 12px 24px;
                          color: #ffffff;
                          background-color: #e63946;
                          text-decoration: none;
                          font-size: 16px;
                          border-radius: 4px;
                          margin-top: 10px;
                      }
                      .cta-button:hover {
                          background-color: #d62839;
                      }
                      .products-grid {
                          display: grid;
                          grid-template-columns: repeat(3, 1fr);
                          gap: 10px;
                          padding: 10px 0;
                      }
                      .product {
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          padding: 10px;
                          border: 1px solid #eee;
                          border-radius: 5px;
                          background-color: #ffffff;
                      }
                      .product img {
                          width: 80px;
                          height: 80px;
                          object-fit: cover;
                          border-radius: 5px;
                          margin-bottom: 10px;
                      }
                      .product-name {
                          font-size: 16px;
                          color: #111111;
                          margin: 10px 0 5px;
                          text-align: center;
                      }
                      .product-price {
                          color: #e63946;
                          font-size: 14px;
                          margin-bottom: 10px;
                      }
                      .footer {
                          background-color: #111111;
                          color: #ffffff;
                          padding: 15px 20px;
                          text-align: center;
                          font-size: 14px;
                      }
                      .footer a {
                          color: #e63946;
                          text-decoration: none;
                      }
                      .coupon {
                          background-color: #f8f8f8;
                          padding: 20px;
                          text-align: center;
                          margin: 20px 0;
                      }
                      .coupon-code {
                          font-size: 18px;
                          font-weight: bold;
                          color: #e63946;
                          margin: 10px 0;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <!-- Header Section -->
                      <div class="header">
                        <h1>Welcome to Pitlane Performence Store</h1>
                      </div>

                      <!-- Hero Image Section -->
                      <div class="hero">
                        <img
                          src="https://via.placeholder.com/600x300?text=Welcome+to+Our+Family!"
                          alt="Welcome Image"
                        />
                      </div>

                      <!-- Content Section -->
                      <div class="content">
                        <h2>Hey there,</h2>
                        <p>
                          Thank you for subscribing to our newsletter! You’re
                          now part of an exclusive community that gets first
                          access to new products, special offers, and the latest
                          updates from [Your Brand].
                        </p>
                        <p>
                          We’re thrilled to have you with us. As a welcome gift,
                          enjoy a special discount on your first purchase!
                        </p>

                        <!-- Coupon Code Section -->
                        <div class="coupon">
                          <p>Use this code at checkout to get 10% off:</p>
                          <div class="coupon-code">WELCOME10</div>
                        </div>

                        <!-- Products Section -->
                        <h2>Our Top Picks for You</h2>
                        <div class="products-grid">
                          <div class="product">
                            <img
                              src="https://via.placeholder.com/100?text=Product+1"
                              alt="Product 1"
                            />
                            <div class="product-name">Product Name 1</div>
                            <div class="product-price">$29.99</div>
                          </div>

                          <div class="product">
                            <img
                              src="https://via.placeholder.com/100?text=Product+2"
                              alt="Product 2"
                            />
                            <div class="product-name">Product Name 2</div>
                            <div class="product-price">$39.99</div>
                          </div>

                          <div class="product">
                            <img
                              src="https://via.placeholder.com/100?text=Product+3"
                              alt="Product 3"
                            />
                            <div class="product-name">Product Name 3</div>
                            <div class="product-price">$49.99</div>
                          </div>
                        </div>

                        <a href="[YourShopLink]" class="cta-button">Shop Now</a>
                      </div>

                      <!-- Footer Section -->
                      <div class="footer">
                        <p>Follow us on:</p>
                        <p>
                          <a href="#">Facebook</a> | <a href="#">Instagram</a> |
                          <a href="#">Twitter</a>
                        </p>
                        <p>&copy; [Year] [Your Brand]. All rights reserved.</p>
                        <p>
                          <a href="#">Unsubscribe</a> |
                          <a href="#">Privacy Policy</a>
                        </p>
                      </div>
                    </div>
                  </body>
                </html>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return;
    }
    console.log('Email sent successfully:', info.response);
  });
};

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { email } = JSON.parse(event.body);

  if (!email) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email is required' }),
    };
  }

  try {
    await connectToDB();
    const existingNewsletter = await Newsletter.exists({ email });

    if (existingNewsletter) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email already subscribed' }),
      };
    }

    const newNewsletter = new Newsletter({ email });
    await newNewsletter.save();

    // Send confirmation email
    await sendConfirmationEmail(email);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: 'Subscribed to newsletter' }),
    };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};