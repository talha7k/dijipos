export const defaultReceiptA4Template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      margin: 0; 
      padding: 20px; 
      background: white;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #374151;
      padding-bottom: 20px;
    }
    .company-info h2 {
      margin: 0 0 10px 0;
      color: #1f2937;
      font-size: 1.5rem;
      font-weight: bold;
    }
    .company-info p {
      margin: 5px 0;
      color: #6b7280;
    }
    .order-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .order-info div {
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .order-info p {
      margin: 5px 0;
    }
    .order-info strong {
      color: #374151;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
    }
    .items-table td {
      border: 1px solid #e5e7eb;
      padding: 12px;
    }
    .items-table td:last-child {
      text-align: right;
      font-weight: 500;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals div {
      width: 300px;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .total-line:last-child {
      border-bottom: none;
    }
    .total-final {
      font-weight: bold;
      font-size: 1.125rem;
      border-top: 2px solid #374151;
      padding-top: 12px;
      margin-top: 8px;
      color: #1f2937;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
    }
    .qr-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px dashed #d1d5db;
    }
    .qr-section p {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 10px;
    }
    .qr-code {
      display: inline-block;
      padding: 10px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    @media print {
      body { 
        padding: 0; 
        background: white;
      }
      .receipt-container { 
        border: none; 
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h2>{{companyName}}</h2>
        <p>{{companyAddress}}</p>
        <p>Tel: {{companyPhone}}</p>
        {{#companyVat}}<p>VAT: {{companyVat}}</p>{{/companyVat}}
      </div>
    </div>

    <!-- Order Information -->
    <div class="order-info">
      <div>
        <p><strong>Order #:</strong> {{orderNumber}}</p>
        <p><strong>Date:</strong> {{orderDate}}</p>
        {{#tableName}}<p><strong>Table:</strong> {{tableName}}</p>{{/tableName}}
      </div>
      <div>
        {{#customerName}}<p><strong>Customer:</strong> {{customerName}}</p>{{/customerName}}
        <p><strong>Status:</strong> Completed</p>
        <p><strong>Payment:</strong> {{paymentMethod}}</p>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantity</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{name}}</td>
          <td>{{quantity}}</td>
          <td>{{total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div>
        <div class="total-line">
          <span>Subtotal:</span>
          <span>{{subtotal}}</span>
        </div>
        {{#vatRate}}
        <div class="total-line">
          <span>VAT ({{vatRate}}%):</span>
          <span>{{vatAmount}}</span>
        </div>
        {{/vatRate}}
        <div class="total-line total-final">
          <span>TOTAL:</span>
          <span>{{total}}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your business!</p>
      
      {{#includeQR}}
      <div class="qr-section">
        <p>ZATCA Compliant QR Code</p>
        <div class="qr-code">
          <img src="{{qrCodeUrl}}" alt="ZATCA QR Code" style="width: 100px; height: 100px;" />
        </div>
      </div>
      {{/includeQR}}
    </div>
  </div>
</body>
</html>`;