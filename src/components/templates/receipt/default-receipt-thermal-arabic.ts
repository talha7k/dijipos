export const defaultArabicReceiptTemplate = `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>إيصال</title>
   <style>
    body { font-family: 'Amiri', serif; margin: 0; padding: 0; font-size: 12px; max-width: {{paperWidth}}px; }
    .header { text-align: center; margin-bottom: 10px; }
    .custom-header { text-align: center; margin-bottom: 10px; font-weight: bold; }
    .content { margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 10px; }
    .custom-footer { text-align: center; margin-bottom: 10px; font-style: italic; }
    .line { display: flex; justify-content: space-between; }
    .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; text-align: right; }
    .total-amount { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { text-align: right; padding: 2px 10px; }
    th { font-weight: bold; border-bottom: 1px solid #000; }
    .amount-col { text-align: right; }
    .qty-col { text-align: center; width: 50px; }
    .item-col { width: calc({{paperWidth}}px - 120px); }
    .bilingual { margin-bottom: 2px; text-align: right; }
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
        <p><strong>Address (العنوان):</strong>  {{companyAddress}}</p>
      </div>
      <div class="bilingual">
        <p><strong>Tel (الهاتف):</strong>  {{companyPhone}}</p>
      </div>
      {{#companyVat}}
      <div class="bilingual">
        <p><strong>VAT Number (الرقم الضريبي):</strong>  {{companyVat}}</p>
      </div>
      {{/companyVat}}
      <hr>
      <div class="bilingual">
        <p><strong>Order # (طلب #):</strong>  {{orderNumber}}</p>
        {{#queueNumber}}<p><strong>Queue # (رقم الدور):</strong>  {{queueNumber}}</p>{{/queueNumber}}
        <p><strong>Type (النوع):</strong>  {{orderType}}</p>
        <p><strong>Date (التاريخ):</strong>  {{orderDate}}</p>
      </div>
      {{#tableName}}
      <div class="bilingual">
        <p><strong>Table (الطاولة):</strong>  {{tableName}}</p>
      </div>
      {{/tableName}}
      {{#customerName}}
      <div class="bilingual">
        <p><strong>Customer (العميل):</strong>  {{customerName}}</p>
      </div>
      {{/customerName}}
      {{#createdByName}}
      <div class="bilingual">
        <p><strong>Served by (خدم من قبل):</strong>  {{createdByName}}</p>
      </div>
      {{/createdByName}}
      <hr>
    </div>

    <div class="content">
      <table>
        <thead>
          <tr>
            <th class="item-col">
              <strong>Item<br>(الصنف)</strong>
            </th>
            <th class="qty-col">
              <strong>Qty<br>(الكمية)</strong>
            </th>
            <th class="amount-col">
              <strong>Amount<br>(المبلغ)</strong>
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
        <span><strong>Total Qty (إجمالي الكمية):</strong>  {{totalQty}}</span>
      </div>
      <div class="bilingual">
        <span><strong>Items Value (قيمة الأصناف):</strong>  {{subtotal}}</span>
      </div>
      <div class="bilingual">
        <span><strong>Total VAT (إجمالي الضريبة) ({{vatRate}}%):</strong>  {{vatAmount}}</span>
      </div>
      <div class="bilingual total-amount">
        <span><strong>TOTAL AMOUNT (المبلغ الإجمالي):</strong>  {{total}}</span>
      </div>
    </div>

    {{#payments}}
    <div style="margin-top: 15px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 10px;">
              <strong>Payment<br>(نوع الدفع):</strong>
            </th>
            <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 10px;">
              <strong>Amount<br>(المبلغ):</strong>
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each payments}}
          <tr>
            <td style="padding: 2px 10px;">{{paymentType}}</td>
            <td style="text-align: right; padding: 2px 10px;">{{amount}}</td>
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

    <div class="footer" style="border-top: 1px dashed #000">
      <div class="bilingual">
        <p>{{companyAddress}}</p> 
      </div>
      {{#includeQR}}
      <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000;">
        <div style="display: inline-block; padding: 5px; background: white; border: 1px solid #ddd;">
          <img src="{{qrCodeUrl}}" alt="رمز QR متوافق مع زاتكا" style="width: 80px; height: 80px;" />
        </div>
      </div>
         <p style="font-size: 0.75rem; color: #666; margin-bottom: 5px;">Powered by DijiBill.com</p>

      {{/includeQR}}
    </div>

  </body>
  </html>`;
