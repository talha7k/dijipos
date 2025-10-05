export const defaultArabicReceiptA4Template = `<!DOCTYPE html>
<html dir="ltr">
<head>
  <meta charset="utf-8">
  <title>إيصال</title>
   <style>
    :root {
      --heading-font: {{headingFont}};
      --body-font: {{bodyFont}};
      --line-spacing: {{lineSpacing}};
    }
    body {
      font-family: var(--body-font), 'Amiri', serif;
      margin: 0;
      padding: 0;
      background: white;
      line-height: var(--line-spacing);
    }
     .receipt-container {
       max-width: 800px;
       margin: {{marginTop}}mm auto {{marginBottom}}mm auto;
       padding: {{paddingTop}}mm {{paddingRight}}mm {{paddingBottom}}mm {{paddingLeft}}mm;
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
      font-family: var(--heading-font), 'Amiri', serif;
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
      font-size: 11px;
    }
    .items-table td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    .items-table td:first-child {
      text-align: left;
      font-weight: 500;
    }
    .totals {
      display: flex;
      justify-content: flex-start;
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
      {{#companyLogo}}
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{companyLogo}}" alt="شعار الشركة" style="max-width: 150px; max-height: 75px;" />
      </div>
      {{/companyLogo}}
      <div class="company-info">
        <h2>{{companyNameAr}}</h2>
        {{#companyName}}
        <p>{{companyName}}</p>
        {{/companyName}}
        <p>{{companyAddress}}</p>
        <p>هاتف: {{companyPhone}}</p>
        {{#companyVat}}<p>الرقم الضريبي: {{companyVat}}</p>{{/companyVat}}
      </div>
    </div>

    <!-- Order Information -->
    <div class="order-info">
      <div>
        <p><strong>رقم الطلب:</strong> {{orderNumber}}</p>
        <p><strong>التاريخ:</strong> {{orderDate}}</p>
        {{#tableName}}<p><strong>الطاولة:</strong> {{tableName}}</p>{{/tableName}}
        {{#createdByName}}<p><strong>خدم من قبل:</strong> {{createdByName}}</p>{{/createdByName}}
      </div>
      <div>
        {{#customerName}}<p><strong>العميل:</strong> {{customerName}}</p>{{/customerName}}
        <p><strong>الحالة:</strong> مكتمل</p>
        <p><strong>طريقة الدفع:</strong> {{paymentMethod}}</p>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>الإجمالي</th>
          <th>الكمية</th>
          <th>الوصف</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{total}}</td>
          <td>{{quantity}}</td>
          <td>{{name}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div>
        <div class="total-line">
          <span>{{subtotal}}</span>
          <span>:المجموع الفرعي</span>
        </div>
        {{#vatRate}}
        <div class="total-line">
          <span>{{vatAmount}}</span>
          <span>({{vatRate}}%) :الضريبة</span>
        </div>
        {{/vatRate}}
        <div class="total-line total-final">
          <span>{{total}}</span>
          <span>:المجموع الكلي</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>شكراً لتعاملكم معنا!</p>

      {{#includeQR}}
      <div class="qr-section">
        <p>رمز QR متوافق مع زاتكا</p>
        <div class="qr-code">
          <img src="{{qrCodeUrl}}" alt="رمز QR متوافق مع زاتكا" style="width: 100px; height: 100px;" />
        </div>
      </div>
      {{/includeQR}}
    </div>
  </div>
</body>
</html>`;