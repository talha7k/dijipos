export const defaultArabicReceiptTemplate = `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>إيصال</title>
  <style>
    body { font-family: 'Amiri', serif; margin: 0; padding: 10px; }
    .header { text-align: center; margin-bottom: 10px; }
    .content { margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 10px; }
    .line { display: flex; justify-content: space-between; }
    .total { font-weight: bold; border-top: 1px dashed; padding-top: 5px; }
  </style>
</head>
<body>
  <div className="header">
    <h2>{{companyNameAr}}</h2>
    {{#companyName}}
    <p>{{companyName}}</p>
    {{/companyName}}
    <p>{{companyAddress}}</p>
    <p>هاتف: {{companyPhone}}</p>
    {{#companyVat}}<p>الرقم الضريبي: {{companyVat}}</p>{{/companyVat}}
    <hr>
    <p>طلب #: {{orderNumber}}</p>
    <p>التاريخ: {{orderDate}}</p>
    {{#tableName}}<p>الطاولة: {{tableName}}</p>{{/tableName}}
    {{#customerName}}<p>العميل: {{customerName}}</p>{{/customerName}}
    <hr>
  </div>

  <div className="content">
    {{#each items}}
    <div className="line">
      <span>{{name}} ({{quantity}}x)</span>
      <span>{{total}} ريال</span>
    </div>
    {{/each}}
  </div>

  <div className="total">
    <div className="line">
      <span>:المجموع الفرعي</span>
      <span>{{subtotal}} ريال</span>
    </div>
    <div className="line">
      <span>:الضريبة ({{vatRate}}%)</span>
      <span>{{vatAmount}} ريال</span>
    </div>
    <div className="line">
      <span>:المجموع الكلي</span>
      <span>{{total}} ريال</span>
    </div>
  </div>

   <div className="footer">
     <p>طريقة الدفع: {{paymentMethod}}</p>
     <p>شكراً لتعاملكم معنا!</p>
     {{#includeQR}}
     <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000;">
       <p style="font-size: 0.75rem; color: #666; margin-bottom: 5px;">رمز QR متوافق مع زاتكا</p>
       <div style="display: inline-block; padding: 5px; background: white; border: 1px solid #ddd;">
         <img src="{{qrCodeUrl}}" alt="رمز QR متوافق مع زاتكا" style="width: 80px; height: 80px;" />
       </div>
     </div>
     {{/includeQR}}
   </div>
 </body>
 </html>`;