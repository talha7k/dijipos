 export const defaultQuoteArabic = `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>عرض سعر</title>
  <style>
    body { font-family: 'Amiri', serif; margin: 0; padding: 0; background: white; }
     .container { max-width: 1000px; margin: {{marginTop}}mm auto {{marginBottom}}mm auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: {{paddingTop}}mm {{paddingRight}}mm {{paddingBottom}}mm {{paddingLeft}}mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .logo-section { position: relative; width: 192px; height: 80px; margin-left: auto; }
    .quote-title { font-size: 2rem; font-weight: bold; color: #1f2937; }
    .quote-number { color: #6b7280; }
    .company-info { text-align: left; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .bill-to { margin-bottom: 20px; }
    .customer-logo { position: relative; width: 128px; height: 64px; margin-bottom: 10px; }
    .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .table { width: 100%; margin-bottom: 40px; border-collapse: collapse; border: 1px solid #d1d5db; }
    .table th { background: #f3f4f6; border: 1px solid #d1d5db; padding: 12px; text-align: right; }
    .table td { border: 1px solid #d1d5db; padding: 12px; text-align: right; }
    .totals { display: flex; justify-content: flex-start; margin-bottom: 40px; }
    .totals div { width: 256px; }
    .total-line { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-bold { font-weight: bold; font-size: 1.125rem; border-top: 1px solid #d1d5db; padding-top: 8px; }
    .notes { margin-bottom: 40px; text-align: right; }
    .validity { background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 40px; text-align: right; }
    .validity h3 { color: #92400e; margin: 0 0 8px 0; }
    .validity p { color: #78350f; margin: 0; }
    .stamp { display: flex; justify-content: flex-start; margin-top: 40px; }
    .stamp div { text-align: center; }
    .stamp img { width: 128px; height: 128px; object-fit: contain; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="quote-title">عرض سعر</h1>
        <p class="quote-number">رقم العرض #{{quoteId}}</p>
      </div>
      <div class="company-info">
        {{#companyLogo}}
        <div class="logo-section">
          <img src="{{companyLogo}}" alt="شعار الشركة" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        {{/companyLogo}}
        <h2 style="font-size: 1.25rem; font-weight: 600;">{{companyNameAr}}</h2>
        {{#companyName}}
        <p style="font-size: 1.125rem;">{{companyName}}</p>
        {{/companyName}}
        <p>{{companyAddress}}</p>
        <p>{{companyEmail}}</p>
        <p>{{companyPhone}}</p>
        {{#companyVat}}<p>الرقم الضريبي: {{companyVat}}</p>{{/companyVat}}
      </div>
    </div>

    <!-- Quote Details -->
    <div class="details-grid">
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">:إلى</h3>
        {{#customerLogo}}
        <div class="customer-logo">
          <img src="{{customerLogo}}" alt="شعار العميل" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        {{/customerLogo}}
        <p style="font-weight: 500;">{{clientName}}</p>
        {{#customerNameAr}}
        <p style="font-size: 1rem;">{{customerNameAr}}</p>
        {{/customerNameAr}}
        <p>{{clientAddress}}</p>
        <p>{{clientEmail}}</p>
        {{#clientVat}}<p>الرقم الضريبي: {{clientVat}}</p>{{/clientVat}}
      </div>
      <div>
        <div class="dates-grid">
          <div>
            <p style="color: #6b7280;">:تاريخ العرض</p>
            <p style="font-weight: 500;">{{quoteDate}}</p>
          </div>
          <div>
            <p style="color: #6b7280;">:صالح حتى</p>
            <p style="font-weight: 500;">{{validUntil}}</p>
          </div>
          <div>
            <p style="color: #6b7280;">:الحالة</p>
            <p style="font-weight: 500; text-transform: capitalize;">{{status}}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Validity Notice -->
    <div class="validity">
      <h3>صلاحية العرض</h3>
      <p>هذا العرض صالح حتى {{validUntil}}. الأسعار والتوافر عرضة للتغيير بعد هذا التاريخ.</p>
    </div>

    <!-- Items Table -->
    <table class="table">
      <thead>
        <tr>
          <th>الوصف</th>
          <th>الكمية</th>
          <th>سعر الوحدة</th>
          <th>المجموع</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>
            <div>
              <p style="font-weight: 500;">{{name}}</p>
              {{#description}}<p style="color: #6b7280; font-size: 0.875rem;">{{description}}</p>{{/description}}
            </div>
          </td>
          <td>{{quantity}}</td>
          <td>{{unitPrice}} ريال</td>
          <td>{{total}} ريال</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div>
        <div class="total-line">
          <span>:المجموع الفرعي</span>
          <span>{{subtotal}} ريال</span>
        </div>
        <div class="total-line">
          <span>:الضريبة ({{taxRate}}%)</span>
          <span>{{taxAmount}} ريال</span>
        </div>
        <div class="total-line total-bold">
          <span>:المجموع الكلي</span>
          <span>{{total}} ريال</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    {{#notes}}
    <div class="notes">
      <h3 style="font-weight: 600; margin-bottom: 8px;">:ملاحظات</h3>
      <p style="color: #6b7280;">{{notes}}</p>
    </div>
    {{/notes}}

    <!-- Company Stamp -->
    {{#companyStamp}}
    <div class="stamp">
      <div>
        <img src="{{companyStamp}}" alt="ختم الشركة" />
        <p style="font-size: 0.875rem; color: #6b7280; margin-top: 8px;">ختم الشركة</p>
      </div>
    </div>
    {{/companyStamp}}
  </div>
</body>
</html>`;