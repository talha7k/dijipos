export const defaultEnglishReceiptTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt</title>
    <style>
     :root {
       --heading-font: {{headingFont}};
       --body-font: {{bodyFont}};
       --line-spacing: {{lineSpacing}};
     }
     p { margin: 0; }
     h1, h2, h3, h4, h5, h6 { margin: 0; }
     body { font-family: var(--body-font), monospace; font-size: 12px; line-height: var(--line-spacing); }
    .header { text-align: center; margin-bottom: 10px; }
    .header h2 { font-family: var(--heading-font), monospace; }
    .custom-header { text-align: center; margin-bottom: 10px; font-weight: bold; font-family: var(--heading-font), monospace; }
    .content { margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 10px; }
    .custom-footer { text-align: center; margin-bottom: 10px; font-style: italic; font-family: var(--heading-font), monospace; }
    .line { display: flex; justify-content: space-between; }
    .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; }
    .total-amount { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed; }
    th, td { text-align: left; padding: 2px 0; }
    th { font-weight: bold; border-bottom: 1px solid #000; font-family: var(--heading-font), monospace; }
    .amount-col { text-align: right; width: 70px; }
    .qty-col { text-align: center; width: 60px; }
    .item-col { width: auto; flex: 1; }
  </style>
</head>
<body>
    {{#customHeader}}
    <div class="custom-header">
      {{customHeader}}
    </div>
    {{/customHeader}}

    <div class="header">
      {{#companyLogo}}
      <div style="text-align: center; margin-bottom: 10px;">
        <img src="{{companyLogo}}" alt="Company Logo" style="max-width: 98%; padding: 2%;" />
      </div>
      {{/companyLogo}}
      <h2>{{companyName}}</h2>
      <p>{{companyAddress}}</p>
      <p>Tel: {{companyPhone}}</p>
      <p>VAT: {{companyVat}}</p>
      <hr>
      <p>Order #: {{orderNumber}}</p>
      {{#queueNumber}}<p>Queue #: {{queueNumber}}</p>{{/queueNumber}}
      <p>Type: {{orderType}}</p>
      <p>Date: {{orderDate}}</p>
      <p>Table: {{tableName}}</p>
      <p>Customer: {{customerName}}</p>
      <p>Served by: {{createdByName}}</p>
      <hr>
    </div>

    <div class="content">
      <table>
        <thead>
          <tr>
            <th class="item-col">Item</th>
            <th class="qty-col">Qty</th>
            <th class="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
           {{#each items}}
           <tr>
             <td>{{name}}</td>
             <td class="qty-col">{{quantity}}</td>
             <td class="amount-col">{{lineTotal}}</td>
           </tr>
           {{/each}}
        </tbody>
      </table>
    </div>

    <div class="total">
      <div class="line">
        <span>Total Qty:</span>
        <span>{{totalQty}}</span>
      </div>
      <div class="line">
        <span>Items Value:</span>
        <span>{{subtotal}}</span>
      </div>
      <div class="line">
        <span>Total VAT ({{vatRate}}%):</span>
        <span>{{vatAmount}}</span>
      </div>
      <div class="line total-amount">
        <span>TOTAL AMOUNT:</span>
        <span>{{total}}</span>
      </div>
    </div>

    <div style="margin-top: 15px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #000; padding: 2px 0;">Payment Type</th>
            <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          {{#each payments}}
          <tr>
            <td>{{paymentType}}</td>
            <td style="text-align: right;">{{amount}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

    {{#customFooter}}
    <div class="custom-footer">
      {{customFooter}}
    </div>
    {{/customFooter}}

    <div class="footer">
      <p>{{companyAddress}}</p>
      <p>Powered by DijiBill.com</p>
      {{#includeQR}}
      <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000;">
        <p style="font-size: 0.75rem; color: #666; margin-bottom: 5px;">ZATCA Compliant QR Code</p>
        <div style="display: inline-block; padding: 5px; background: white; border: 1px solid #ddd;">
          <img src="{{qrCodeUrl}}" alt="ZATCA QR Code" style="max-width: 90%; padding: 2%;" />
        </div>
      </div>
      {{/includeQR}}
    </div>
  </body>
  </html>`;
