export const getNewsletterTemplate = (subject: string, content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #eee;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          border-top: 2px solid #eee;
          font-size: 0.9em;
          color: #666;
        }
        .unsubscribe {
          color: #999;
          font-size: 0.8em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${subject}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ATE Leslie Project</p>
        <p class="unsubscribe">
          Pour vous désabonner, connectez-vous à votre compte et modifiez vos préférences de newsletter.
        </p>
      </div>
    </body>
    </html>
  `
}; 