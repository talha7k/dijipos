export const defaultArabicReceiptTemplate = `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>إيصال</title>
  <style>
    body { font-family: 'Amiri', serif; margin: 0; padding: 10px; font-size: 12px; }
    .header { text-align: center; margin-bottom: 10px; }
    .custom-header { text-align: center; margin-bottom: 10px; font-weight: bold; }
    .content { margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 10px; }
    .custom-footer { text-align: center; margin-bottom: 10px; font-style: italic; }
    .line { display: flex; justify-content: space-between; }
    .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; }
    .total-amount { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { text-align: left; padding: 2px 0; }
    th { font-weight: bold; border-bottom: 1px solid #000; }
    .amount-col { text-align: right; }
    .qty-col { text-align: center; width: 40px; }
    .item-col { width: 120px; }
    .bilingual { margin-bottom: 2px; }
    .english { text-align: left; direction: ltr; margin-bottom: 1px; }
    .arabic { text-align: right; direction: rtl; }
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
        <img src="{{companyLogo}}" alt="شعار الشركة" style="max-width: 100px; max-height: 50px;" />
      </div>
      {{/companyLogo}}
      <div class="bilingual">
        <div class="english"><h2>{{companyName}}</h2></div>
        <div class="arabic"><h2>{{companyNameAr}}</h2></div>
      </div>
      <div class="bilingual">
        <div class="english"><p>{{companyAddress}}</p></div>
        <div class="arabic"><p>{{companyAddress}}</p></div>
      </div>
      <div class="bilingual">
        <div class="english"><p>Tel: {{companyPhone}}</p></div>
        <div class="arabic"><p>هاتف: {{companyPhone}}</p></div>
      </div>
      {{#companyVat}}
      <div class="bilingual">
        <div class="english"><p>VAT: {{companyVat}}</p></div>
        <div class="arabic"><p>الرقم الضريبي: {{companyVat}}</p></div>
      </div>
      {{/companyVat}}
      <hr>
      <div class="bilingual">
        <div class="english">
          <p>Order #: {{orderNumber}}</p>
          {{#queueNumber}}<p>Queue #: {{queueNumber}}</p>{{/queueNumber}}
          <p>Type: {{orderType}}</p>
          <p>Date: {{orderDate}}</p>
        </div>
        <div class="arabic">
          <p>طلب #: {{orderNumber}}</p>
          {{#queueNumber}}<p>رقم الدور: {{queueNumber}}</p>{{/queueNumber}}
          <p>النوع: {{orderType}}</p>
          <p>التاريخ: {{orderDate}}</p>
        </div>
      </div>
      {{#tableName}}
      <div class="bilingual">
        <div class="english"><p>Table: {{tableName}}</p></div>
        <div class="arabic"><p>الطاولة: {{tableName}}</p></div>
      </div>
      {{/tableName}}
      {{#customerName}}
      <div class="bilingual">
        <div class="english"><p>Customer: {{customerName}}</p></div>
        <div class="arabic"><p>العميل: {{customerName}}</p></div>
      </div>
      {{/customerName}}
      {{#createdByName}}
      <div class="bilingual">
        <div class="english"><p>Served by: {{createdByName}}</p></div>
        <div class="arabic"><p>خدم من قبل: {{createdByName}}</p></div>
      </div>
      {{/createdByName}}
      <hr>
    </div>

    <div class="content">
      <table>
        <thead>
          <tr>
            <th class="item-col">
              <div class="english">Item</div>
              <div class="arabic">الصنف</div>
            </th>
            <th class="qty-col">
              <div class="english">Qty</div>
              <div class="arabic">الكمية</div>
            </th>
            <th class="amount-col">
              <div class="english">Amount</div>
              <div class="arabic">المبلغ</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>{{name}}</td>
            <td class="qty-col">{{quantity}}</td>
            <td class="amount-col">{{total}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

    <div class="total">
      <div class="bilingual">
        <div class="english"><span>Total Qty: {{totalQty}}</span></div>
        <div class="arabic"><span>إجمالي الكمية: {{totalQty}}</span></div>
      </div>
      <div class="bilingual">
        <div class="english"><span>Items Value: {{subtotal}}</span></div>
        <div class="arabic"><span>قيمة الأصناف: {{subtotal}}</span></div>
      </div>
      <div class="bilingual">
        <div class="english"><span>Total VAT ({{vatRate}}%): {{vatAmount}}</span></div>
        <div class="arabic"><span>إجمالي الضريبة ({{vatRate}}%): {{vatAmount}}</span></div>
      </div>
      <div class="bilingual total-amount">
        <div class="english"><span>TOTAL AMOUNT: {{total}}</span></div>
        <div class="arabic"><span>المبلغ الإجمالي: {{total}}</span></div>
      </div>
    </div>

    {{#payments}}
    <div style="margin-top: 15px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #000; padding: 2px 0;">
              <div class="english">Payment Type</div>
              <div class="arabic">نوع الدفع</div>
            </th>
            <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 0;">
              <div class="english">Amount</div>
              <div class="arabic">المبلغ</div>
            </th>
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
    {{/payments}}

    {{#customFooter}}
    <div class="custom-footer">
      {{customFooter}}
    </div>
    {{/customFooter}}

    <div class="footer">
      <div class="bilingual">
        <div class="english"><p>{{companyAddress}} | Powered by DijiBill.com</p></div>
        <div class="arabic"><p>{{companyAddress}} | مشغل بواسطة ديجي بيل</p></div>
      </div>
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