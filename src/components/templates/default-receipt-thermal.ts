export const defaultReceiptTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt</title>
  <style>
    body { font-family: monospace; margin: 0; padding: 10px; }
    .header { text-align: center; margin-bottom: 10px; }
    .content { margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 10px; }
    .line { display: flex; justify-content: space-between; }
    .total { font-weight: bold; border-top: 1px dashed; padding-top: 5px; }
  </style>
</head>
<body>
   <div className="header">
     {{#companyLogo}}
     <div style="text-align: center; margin-bottom: 10px;">
       <img src="{{companyLogo}}" alt="Company Logo" style="max-width: 100px; max-height: 50px;" />
     </div>
     {{/companyLogo}}
     <h2>{{companyName}}</h2>
     <p>{{companyAddress}}</p>
     <p>Tel: {{companyPhone}}</p>
     <p>VAT: {{companyVat}}</p>
     <hr>
     <p>Order #: {{orderNumber}}</p>
     <p>Date: {{orderDate}}</p>
     <p>Table: {{tableName}}</p>
     <p>Customer: {{customerName}}</p>
     <p>Served by: {{createdByName}}</p>
     <hr>
   </div>

  <div className="content">
    {{#each items}}
    <div className="line">
      <span>{{name}} ({{quantity}}x)</span>
      <span>{{total}}</span>
    </div>
    {{/each}}
  </div>

  <div className="total">
    <div className="line">
      <span>Subtotal:</span>
      <span>{{subtotal}}</span>
    </div>
    <div className="line">
      <span>VAT ({{vatRate}}%):</span>
      <span>{{vatAmount}}</span>
    </div>
    <div className="line">
      <span>TOTAL:</span>
      <span>{{total}}</span>
    </div>
  </div>

   <div className="footer">
     <p>Payment: {{paymentMethod}}</p>
     <p>Thank you for your business!</p>
     {{#includeQR}}
     <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000;">
       <p style="font-size: 0.75rem; color: #666; margin-bottom: 5px;">ZATCA Compliant QR Code</p>
       <div style="display: inline-block; padding: 5px; background: white; border: 1px solid #ddd;">
         <img src="{{qrCodeUrl}}" alt="ZATCA QR Code" style="width: 80px; height: 80px;" />
       </div>
     </div>
     {{/includeQR}}
   </div>
 </body>
 </html>`;