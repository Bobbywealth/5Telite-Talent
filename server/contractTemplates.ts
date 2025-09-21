import { ContractData } from './contractService';

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modeling' | 'acting' | 'commercial' | 'event' | 'general';
  generateContent: (data: ContractData) => string;
}

export class ContractTemplates {
  
  // 📸 MODELING CONTRACT TEMPLATE
  static modelingContract: ContractTemplate = {
    id: 'modeling-standard',
    name: 'Professional Modeling Agreement',
    description: 'Comprehensive contract for fashion, commercial, and editorial modeling work',
    category: 'modeling',
    generateContent: (data: ContractData) => {
      const { booking, talent, talentProfile, client } = data;
      
      return `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px;">

<!-- Header -->
<div style="text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
  <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0;">PROFESSIONAL MODELING AGREEMENT</h1>
  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">5T Elite Talent, Inc.</p>
  <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">122 W 26th St, Suite 902, New York, NY 10001</p>
</div>

<!-- Agreement Details -->
<div style="margin-bottom: 25px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="font-weight: bold; padding: 5px 0;">Agreement Number:</td>
      <td>${booking.code}</td>
      <td style="font-weight: bold; padding: 5px 0;">Date:</td>
      <td>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
    </tr>
  </table>
</div>

<!-- Parties Section -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PARTIES TO AGREEMENT</h2>
  
  <div style="display: flex; gap: 40px; margin-top: 15px;">
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">CLIENT:</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${client.firstName} ${client.lastName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${client.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${client.phone || 'On file'}</p>
    </div>
    
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">TALENT:</h3>
      <p style="margin: 5px 0;"><strong>Legal Name:</strong> ${talent.firstName} ${talent.lastName}</p>
      ${talentProfile?.stageName ? `<p style="margin: 5px 0;"><strong>Professional Name:</strong> ${talentProfile.stageName}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Email:</strong> ${talent.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${talent.phone || 'On file'}</p>
    </div>
  </div>
</div>

<!-- Project Details -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PROJECT DETAILS</h2>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="font-weight: bold; padding: 8px 0; width: 150px;">Project Title:</td>
        <td style="padding: 8px 0;">${booking.title}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Shoot Location:</td>
        <td style="padding: 8px 0;">${booking.location || 'To be confirmed'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Shoot Date:</td>
        <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Call Time:</td>
        <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Wrap Time:</td>
        <td style="padding: 8px 0;">${new Date(booking.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Modeling Rate:</td>
        <td style="padding: 8px 0;">$${booking.rate || 'As agreed'} ${booking.rate ? 'per session' : ''}</td>
      </tr>
    </table>
  </div>
</div>

<!-- Scope of Work -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">SCOPE OF MODELING SERVICES</h2>
  <div style="margin-top: 15px;">
    <p><strong>Services Include:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li>Professional modeling services as specified</li>
      <li>Wardrobe changes as required (up to 5 looks)</li>
      <li>Professional hair and makeup session</li>
      <li>Collaboration with creative team and photographer</li>
      <li>Standard posing and direction following</li>
    </ul>
    
    ${booking.deliverables ? `
    <p style="margin-top: 15px;"><strong>Specific Requirements:</strong></p>
    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
      ${booking.deliverables}
    </div>
    ` : ''}
  </div>
</div>

<!-- Usage Rights -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">USAGE RIGHTS & LICENSING</h2>
  <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 15px;">
    ${booking.usage ? `
    <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
      <pre style="font-family: Arial, sans-serif; font-size: 14px; white-space: pre-wrap;">${JSON.stringify(booking.usage, null, 2)}</pre>
    </div>
    ` : `
    <p><strong>Standard Usage Rights Include:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li><strong>Digital Marketing:</strong> Website, social media, email campaigns (1 year)</li>
      <li><strong>Print Advertising:</strong> Magazines, brochures, catalogs (6 months)</li>
      <li><strong>Territory:</strong> North America</li>
      <li><strong>Exclusivity:</strong> Non-exclusive (talent may work with competitors)</li>
    </ul>
    <p style="margin-top: 15px; font-style: italic; color: #666;">
      <strong>Note:</strong> Extended usage, exclusivity, or international rights require separate negotiation and additional compensation.
    </p>
    `}
  </div>
</div>

<!-- Terms and Conditions -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">TERMS & CONDITIONS</h2>
  
  <div style="margin-top: 15px;">
    <ol style="line-height: 1.8;">
      <li><strong>PROFESSIONAL CONDUCT:</strong> Talent agrees to arrive punctually, maintain professional demeanor, and follow creative direction. Talent must be well-rested, groomed, and ready to work.</li>
      
      <li><strong>WARDROBE & STYLING:</strong> Talent will bring appropriate undergarments and personal styling items as discussed. Client will provide wardrobe unless otherwise specified.</li>
      
      <li><strong>PAYMENT TERMS:</strong> Payment due within 30 days of shoot completion. Late payments subject to 1.5% monthly service charge.</li>
      
      <li><strong>CANCELLATION POLICY:</strong>
        <ul style="margin-left: 20px; margin-top: 10px;">
          <li>24+ hours notice: No penalty</li>
          <li>12-24 hours notice: 50% of session fee</li>
          <li>Less than 12 hours: 100% of session fee</li>
        </ul>
      </li>
      
      <li><strong>WEATHER/FORCE MAJEURE:</strong> Outdoor shoots may be rescheduled due to weather. Neither party liable for acts of God, illness, or other circumstances beyond reasonable control.</li>
      
      <li><strong>IMAGE APPROVAL:</strong> Client has final approval on image selection and retouching. Talent may request removal of unflattering images.</li>
      
      <li><strong>CONFIDENTIALITY:</strong> Both parties agree to maintain confidentiality regarding unreleased campaigns, pricing, and proprietary information.</li>
      
      <li><strong>LIABILITY:</strong> Each party maintains their own insurance. Talent responsible for personal property. Client provides safe working environment.</li>
      
      <li><strong>DISPUTE RESOLUTION:</strong> Any disputes resolved through binding arbitration in New York, NY under American Arbitration Association rules.</li>
    </ol>
  </div>
</div>

${booking.notes ? `
<!-- Additional Notes -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">ADDITIONAL NOTES</h2>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
    ${booking.notes}
  </div>
</div>
` : ''}

<!-- Signature Section -->
<div style="margin-top: 40px; page-break-inside: avoid;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">AGREEMENT EXECUTION</h2>
  
  <p style="margin: 20px 0; font-style: italic;">
    By signing below, both parties acknowledge they have read, understood, and agree to be bound by all terms and conditions of this modeling agreement.
  </p>
  
  <div style="display: flex; gap: 60px; margin-top: 40px;">
    <div style="flex: 1;">
      <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 40px;"></div>
      <p style="margin: 5px 0; font-weight: bold;">${talent.firstName} ${talent.lastName} (Talent)</p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">Date: _______________</p>
    </div>
    
    <div style="flex: 1;">
      <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 40px;"></div>
      <p style="margin: 5px 0; font-weight: bold;">${client.firstName} ${client.lastName} (Client)</p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">Date: _______________</p>
    </div>
  </div>
  
  <div style="margin-top: 30px; padding: 15px; background: #f1f3f4; border-radius: 5px; font-size: 12px; color: #666;">
    <p style="margin: 0; text-align: center;">
      <strong>This is a legally binding agreement.</strong> Please read all terms carefully before signing. 
      Questions? Contact 5T Elite Talent at admin@5telite.com or (555) 123-4567.
    </p>
  </div>
</div>

</div>
      `;
    }
  };

  // 🎭 ACTING CONTRACT TEMPLATE
  static actingContract: ContractTemplate = {
    id: 'acting-standard',
    name: 'Professional Acting Agreement',
    description: 'Comprehensive contract for film, TV, theater, and commercial acting work',
    category: 'acting',
    generateContent: (data: ContractData) => {
      const { booking, talent, talentProfile, client } = data;
      
      return `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px;">

<!-- Header -->
<div style="text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
  <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0;">PROFESSIONAL ACTING AGREEMENT</h1>
  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">5T Elite Talent, Inc.</p>
  <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">122 W 26th St, Suite 902, New York, NY 10001</p>
</div>

<!-- Agreement Details -->
<div style="margin-bottom: 25px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="font-weight: bold; padding: 5px 0;">Agreement Number:</td>
      <td>${booking.code}</td>
      <td style="font-weight: bold; padding: 5px 0;">Date:</td>
      <td>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
    </tr>
  </table>
</div>

<!-- Parties Section -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PARTIES TO AGREEMENT</h2>
  
  <div style="display: flex; gap: 40px; margin-top: 15px;">
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">PRODUCTION COMPANY/CLIENT:</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${client.firstName} ${client.lastName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${client.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${client.phone || 'On file'}</p>
    </div>
    
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">ACTOR/PERFORMER:</h3>
      <p style="margin: 5px 0;"><strong>Legal Name:</strong> ${talent.firstName} ${talent.lastName}</p>
      ${talentProfile?.stageName ? `<p style="margin: 5px 0;"><strong>Stage Name:</strong> ${talentProfile.stageName}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Email:</strong> ${talent.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${talent.phone || 'On file'}</p>
    </div>
  </div>
</div>

<!-- Production Details -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PRODUCTION DETAILS</h2>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="font-weight: bold; padding: 8px 0; width: 150px;">Project Title:</td>
        <td style="padding: 8px 0;">${booking.title}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Production Type:</td>
        <td style="padding: 8px 0;">${booking.eventType || 'Performance'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Location:</td>
        <td style="padding: 8px 0;">${booking.location || 'To be confirmed'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Shoot/Performance Date:</td>
        <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Call Time:</td>
        <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Wrap Time:</td>
        <td style="padding: 8px 0;">${new Date(booking.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Performance Fee:</td>
        <td style="padding: 8px 0;">$${booking.rate || 'As agreed'} ${booking.rate ? 'per performance/day' : ''}</td>
      </tr>
    </table>
  </div>
</div>

<!-- Role & Responsibilities -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">ROLE & PERFORMANCE REQUIREMENTS</h2>
  <div style="margin-top: 15px;">
    <p><strong>Performance Services Include:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li>Professional acting performance as directed</li>
      <li>Attendance at rehearsals and script readings</li>
      <li>Wardrobe fittings and costume coordination</li>
      <li>Collaboration with director and creative team</li>
      <li>Promotional activities as specified</li>
    </ul>
    
    ${booking.deliverables ? `
    <p style="margin-top: 15px;"><strong>Specific Role Requirements:</strong></p>
    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
      ${booking.deliverables}
    </div>
    ` : ''}
  </div>
</div>

<!-- Usage Rights -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">USAGE RIGHTS & DISTRIBUTION</h2>
  <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 15px;">
    ${booking.usage ? `
    <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
      <pre style="font-family: Arial, sans-serif; font-size: 14px; white-space: pre-wrap;">${JSON.stringify(booking.usage, null, 2)}</pre>
    </div>
    ` : `
    <p><strong>Standard Usage Rights Include:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li><strong>Initial Distribution:</strong> Theatrical, streaming, broadcast (as applicable)</li>
      <li><strong>Promotional Use:</strong> Trailers, behind-the-scenes, press materials</li>
      <li><strong>Territory:</strong> North America (unless specified otherwise)</li>
      <li><strong>Duration:</strong> In perpetuity for the specific production</li>
    </ul>
    <p style="margin-top: 15px; font-style: italic; color: #666;">
      <strong>Note:</strong> Additional distribution territories or formats may require supplemental compensation.
    </p>
    `}
  </div>
</div>

<!-- Terms and Conditions -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">TERMS & CONDITIONS</h2>
  
  <div style="margin-top: 15px;">
    <ol style="line-height: 1.8;">
      <li><strong>PROFESSIONAL CONDUCT:</strong> Actor agrees to arrive punctually, maintain professional behavior, take direction, and perform to the best of their ability.</li>
      
      <li><strong>REHEARSALS & PREPARATION:</strong> Actor will attend all scheduled rehearsals, script readings, and preparation sessions as required by production.</li>
      
      <li><strong>PAYMENT TERMS:</strong> Payment due within 30 days of performance completion. Overtime rates apply for work exceeding 10 hours per day.</li>
      
      <li><strong>CANCELLATION POLICY:</strong>
        <ul style="margin-left: 20px; margin-top: 10px;">
          <li>48+ hours notice: No penalty</li>
          <li>24-48 hours notice: 50% of performance fee</li>
          <li>Less than 24 hours: 100% of performance fee</li>
        </ul>
      </li>
      
      <li><strong>FORCE MAJEURE:</strong> Neither party liable for delays due to weather, illness, acts of God, or other circumstances beyond reasonable control.</li>
      
      <li><strong>CREATIVE CONTROL:</strong> Final creative decisions rest with director/producer. Actor may provide input but must follow final direction.</li>
      
      <li><strong>CONFIDENTIALITY:</strong> Actor agrees to maintain confidentiality regarding script, plot details, and production information until public release.</li>
      
      <li><strong>SAFETY & INSURANCE:</strong> Production company provides safe working environment and general liability coverage. Actor responsible for personal property.</li>
      
      <li><strong>DISPUTE RESOLUTION:</strong> Any disputes resolved through binding arbitration in New York, NY under Screen Actors Guild or American Arbitration Association rules.</li>
    </ol>
  </div>
</div>

${booking.notes ? `
<!-- Additional Notes -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">ADDITIONAL PRODUCTION NOTES</h2>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
    ${booking.notes}
  </div>
</div>
` : ''}

<!-- Signature Section -->
<div style="margin-top: 40px; page-break-inside: avoid;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">AGREEMENT EXECUTION</h2>
  
  <p style="margin: 20px 0; font-style: italic;">
    By signing below, both parties acknowledge they have read, understood, and agree to be bound by all terms and conditions of this acting agreement.
  </p>
  
  <div style="display: flex; gap: 60px; margin-top: 40px;">
    <div style="flex: 1;">
      <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 40px;"></div>
      <p style="margin: 5px 0; font-weight: bold;">${talent.firstName} ${talent.lastName} (Actor)</p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">Date: _______________</p>
    </div>
    
    <div style="flex: 1;">
      <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 40px;"></div>
      <p style="margin: 5px 0; font-weight: bold;">${client.firstName} ${client.lastName} (Producer/Client)</p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">Date: _______________</p>
    </div>
  </div>
  
  <div style="margin-top: 30px; padding: 15px; background: #f1f3f4; border-radius: 5px; font-size: 12px; color: #666;">
    <p style="margin: 0; text-align: center;">
      <strong>This is a legally binding agreement.</strong> Please read all terms carefully before signing. 
      Questions? Contact 5T Elite Talent at admin@5telite.com or (555) 123-4567.
    </p>
  </div>
</div>

</div>
      `;
    }
  };

  // 📺 COMMERCIAL CONTRACT TEMPLATE
  static commercialContract: ContractTemplate = {
    id: 'commercial-standard',
    name: 'Commercial Advertisement Agreement',
    description: 'Professional contract for TV, digital, and print commercial work',
    category: 'commercial',
    generateContent: (data: ContractData) => {
      const { booking, talent, talentProfile, client } = data;
      
      return `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px;">

<!-- Header -->
<div style="text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
  <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0;">COMMERCIAL ADVERTISEMENT AGREEMENT</h1>
  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">5T Elite Talent, Inc.</p>
  <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">122 W 26th St, Suite 902, New York, NY 10001</p>
</div>

<!-- Agreement Details -->
<div style="margin-bottom: 25px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="font-weight: bold; padding: 5px 0;">Agreement Number:</td>
      <td>${booking.code}</td>
      <td style="font-weight: bold; padding: 5px 0;">Date:</td>
      <td>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
    </tr>
  </table>
</div>

<!-- Parties Section -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PARTIES TO AGREEMENT</h2>
  
  <div style="display: flex; gap: 40px; margin-top: 15px;">
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">ADVERTISER/AGENCY:</h3>
      <p style="margin: 5px 0;"><strong>Company:</strong> ${client.firstName} ${client.lastName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${client.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${client.phone || 'On file'}</p>
    </div>
    
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">TALENT/SPOKESPERSON:</h3>
      <p style="margin: 5px 0;"><strong>Legal Name:</strong> ${talent.firstName} ${talent.lastName}</p>
      ${talentProfile?.stageName ? `<p style="margin: 5px 0;"><strong>Professional Name:</strong> ${talentProfile.stageName}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Email:</strong> ${talent.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${talent.phone || 'On file'}</p>
    </div>
  </div>
</div>

<!-- Commercial Details -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">COMMERCIAL PRODUCTION DETAILS</h2>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="font-weight: bold; padding: 8px 0; width: 150px;">Campaign Title:</td>
        <td style="padding: 8px 0;">${booking.title}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Commercial Type:</td>
        <td style="padding: 8px 0;">${booking.eventType || 'Commercial Advertisement'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Production Location:</td>
        <td style="padding: 8px 0;">${booking.location || 'Studio TBD'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Shoot Date:</td>
        <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Call Time:</td>
        <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Estimated Wrap:</td>
        <td style="padding: 8px 0;">${new Date(booking.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Session Fee:</td>
        <td style="padding: 8px 0;">$${booking.rate || 'As agreed'} ${booking.rate ? '(plus usage fees)' : ''}</td>
      </tr>
    </table>
  </div>
</div>

<!-- Performance Requirements -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PERFORMANCE & DELIVERABLES</h2>
  <div style="margin-top: 15px;">
    <p><strong>Commercial Services Include:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li>On-camera performance and dialogue delivery</li>
      <li>Product demonstration and interaction</li>
      <li>Multiple takes and angle coverage</li>
      <li>Wardrobe changes as required</li>
      <li>Voice-over recording (if applicable)</li>
    </ul>
    
    ${booking.deliverables ? `
    <p style="margin-top: 15px;"><strong>Specific Campaign Requirements:</strong></p>
    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
      ${booking.deliverables}
    </div>
    ` : ''}
  </div>
</div>

<!-- Usage Rights & Media Buy -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">USAGE RIGHTS & MEDIA DISTRIBUTION</h2>
  <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 15px;">
    ${booking.usage ? `
    <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
      <pre style="font-family: Arial, sans-serif; font-size: 14px; white-space: pre-wrap;">${JSON.stringify(booking.usage, null, 2)}</pre>
    </div>
    ` : `
    <p><strong>Standard Commercial Usage Includes:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li><strong>Television:</strong> National broadcast (13 weeks initial cycle)</li>
      <li><strong>Digital/Online:</strong> Social media, YouTube, website (6 months)</li>
      <li><strong>Radio:</strong> Audio version (if applicable)</li>
      <li><strong>Territory:</strong> United States</li>
      <li><strong>Exclusivity:</strong> Category exclusive during active campaign</li>
    </ul>
    <p style="margin-top: 15px; font-style: italic; color: #666;">
      <strong>Note:</strong> Usage fees calculated separately based on media buy and market size. Extended usage requires additional compensation.
    </p>
    `}
  </div>
</div>

<!-- Terms and Conditions -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">COMMERCIAL TERMS & CONDITIONS</h2>
  
  <div style="margin-top: 15px;">
    <ol style="line-height: 1.8;">
      <li><strong>PROFESSIONAL CONDUCT:</strong> Talent agrees to maintain professional demeanor, arrive punctually, and follow creative direction for optimal commercial effectiveness.</li>
      
      <li><strong>PRODUCT ENDORSEMENT:</strong> Talent agrees to authentically represent the product/brand and avoid conflicting endorsements during exclusivity period.</li>
      
      <li><strong>PAYMENT STRUCTURE:</strong> Session fee due within 30 days. Usage fees calculated and paid based on actual media placement and market penetration.</li>
      
      <li><strong>CANCELLATION POLICY:</strong>
        <ul style="margin-left: 20px; margin-top: 10px;">
          <li>48+ hours notice: No penalty (weather hold fees may apply)</li>
          <li>24-48 hours notice: 50% of session fee</li>
          <li>Less than 24 hours: 100% of session fee</li>
        </ul>
      </li>
      
      <li><strong>WEATHER/POSTPONEMENT:</strong> Outdoor shoots subject to weather delays. Talent on "weather hold" receives 50% of session fee for availability.</li>
      
      <li><strong>CREATIVE APPROVAL:</strong> Client has final approval on commercial edit. Talent may request review of final version before public release.</li>
      
      <li><strong>EXCLUSIVITY:</strong> Talent agrees not to appear in competing product commercials during active campaign period as specified in usage terms.</li>
      
      <li><strong>RESIDUALS:</strong> Additional compensation due for usage beyond initial cycle, calculated per industry standards (SAG-AFTRA rates when applicable).</li>
      
      <li><strong>DISPUTE RESOLUTION:</strong> Commercial disputes resolved through American Arbitration Association or applicable union procedures.</li>
    </ol>
  </div>
</div>

${booking.notes ? `
<!-- Additional Notes -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">CAMPAIGN NOTES</h2>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
    ${booking.notes}
  </div>
</div>
` : ''}

<!-- Signature Section -->
<div style="margin-top: 40px; page-break-inside: avoid;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">AGREEMENT EXECUTION</h2>
  
  <p style="margin: 20px 0; font-style: italic;">
    By signing below, both parties acknowledge they have read, understood, and agree to be bound by all terms and conditions of this commercial agreement.
  </p>
  
  <div style="display: flex; gap: 60px; margin-top: 40px;">
    <div style="flex: 1;">
      <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 40px;"></div>
      <p style="margin: 5px 0; font-weight: bold;">${talent.firstName} ${talent.lastName} (Talent)</p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">Date: _______________</p>
    </div>
    
    <div style="flex: 1;">
      <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 40px;"></div>
      <p style="margin: 5px 0; font-weight: bold;">${client.firstName} ${client.lastName} (Advertiser)</p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">Date: _______________</p>
    </div>
  </div>
  
  <div style="margin-top: 30px; padding: 15px; background: #f1f3f4; border-radius: 5px; font-size: 12px; color: #666;">
    <p style="margin: 0; text-align: center;">
      <strong>This is a legally binding agreement.</strong> Please read all terms carefully before signing. 
      Questions? Contact 5T Elite Talent at admin@5telite.com or (555) 123-4567.
    </p>
  </div>
</div>

</div>
      `;
    }
  };

  // 🎉 EVENT CONTRACT TEMPLATE
  static eventContract: ContractTemplate = {
    id: 'event-standard',
    name: 'Live Event Performance Agreement',
    description: 'Professional contract for live events, appearances, and performances',
    category: 'event',
    generateContent: (data: ContractData) => {
      const { booking, talent, talentProfile, client } = data;
      
      return `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px;">

<!-- Header -->
<div style="text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
  <h1 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0;">LIVE EVENT PERFORMANCE AGREEMENT</h1>
  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">5T Elite Talent, Inc.</p>
  <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">122 W 26th St, Suite 902, New York, NY 10001</p>
</div>

<!-- Agreement Details -->
<div style="margin-bottom: 25px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="font-weight: bold; padding: 5px 0;">Agreement Number:</td>
      <td>${booking.code}</td>
      <td style="font-weight: bold; padding: 5px 0;">Date:</td>
      <td>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
    </tr>
  </table>
</div>

<!-- Parties Section -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PARTIES TO AGREEMENT</h2>
  
  <div style="display: flex; gap: 40px; margin-top: 15px;">
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">EVENT ORGANIZER:</h3>
      <p style="margin: 5px 0;"><strong>Organization:</strong> ${client.firstName} ${client.lastName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${client.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${client.phone || 'On file'}</p>
    </div>
    
    <div style="flex: 1;">
      <h3 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">PERFORMER/TALENT:</h3>
      <p style="margin: 5px 0;"><strong>Legal Name:</strong> ${talent.firstName} ${talent.lastName}</p>
      ${talentProfile?.stageName ? `<p style="margin: 5px 0;"><strong>Stage Name:</strong> ${talentProfile.stageName}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Email:</strong> ${talent.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${talent.phone || 'On file'}</p>
    </div>
  </div>
</div>

<!-- Event Details -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">EVENT DETAILS</h2>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="font-weight: bold; padding: 8px 0; width: 150px;">Event Name:</td>
        <td style="padding: 8px 0;">${booking.title}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Event Type:</td>
        <td style="padding: 8px 0;">${booking.eventType || 'Live Performance'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Venue:</td>
        <td style="padding: 8px 0;">${booking.location || 'Venue TBD'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Event Date:</td>
        <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Arrival Time:</td>
        <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Event End:</td>
        <td style="padding: 8px 0;">${new Date(booking.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold; padding: 8px 0;">Performance Fee:</td>
        <td style="padding: 8px 0;">$${booking.rate || 'As agreed'} ${booking.rate ? 'per event' : ''}</td>
      </tr>
    </table>
  </div>
</div>

<!-- Performance Requirements -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PERFORMANCE REQUIREMENTS</h2>
  <div style="margin-top: 15px;">
    <p><strong>Event Services Include:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li>Live performance as specified</li>
      <li>Professional appearance and interaction</li>
      <li>Meet and greet with attendees (if applicable)</li>
      <li>Photo opportunities and media interviews</li>
      <li>Promotional activities as agreed</li>
    </ul>
    
    ${booking.deliverables ? `
    <p style="margin-top: 15px;"><strong>Specific Event Requirements:</strong></p>
    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
      ${booking.deliverables}
    </div>
    ` : ''}
  </div>
</div>

<!-- Technical & Logistics -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">TECHNICAL REQUIREMENTS & LOGISTICS</h2>
  <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 15px;">
    <p><strong>Organizer Responsibilities:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li><strong>Sound System:</strong> Professional audio equipment and sound check</li>
      <li><strong>Lighting:</strong> Adequate stage/performance lighting</li>
      <li><strong>Security:</strong> Crowd control and performer safety</li>
      <li><strong>Transportation:</strong> Travel arrangements (if applicable)</li>
      <li><strong>Accommodations:</strong> Hotel/lodging (for out-of-town events)</li>
    </ul>
    
    <p style="margin-top: 15px;"><strong>Performer Responsibilities:</strong></p>
    <ul style="margin-left: 20px; line-height: 1.8;">
      <li>Professional performance equipment (instruments, etc.)</li>
      <li>Stage-appropriate wardrobe and styling</li>
      <li>Punctual arrival and professional conduct</li>
      <li>Compliance with venue rules and regulations</li>
    </ul>
  </div>
</div>

<!-- Terms and Conditions -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">EVENT TERMS & CONDITIONS</h2>
  
  <div style="margin-top: 15px;">
    <ol style="line-height: 1.8;">
      <li><strong>PROFESSIONAL CONDUCT:</strong> Performer agrees to maintain professional behavior, arrive punctually, and deliver quality performance suitable for the event audience.</li>
      
      <li><strong>SOUND CHECK & REHEARSAL:</strong> Performer entitled to adequate sound check and technical rehearsal time before event commencement.</li>
      
      <li><strong>PAYMENT TERMS:</strong> 50% deposit due upon signing, balance due within 30 days of event completion. Travel expenses reimbursed separately.</li>
      
      <li><strong>CANCELLATION POLICY:</strong>
        <ul style="margin-left: 20px; margin-top: 10px;">
          <li>30+ days notice: Deposit refunded minus 10% administrative fee</li>
          <li>14-30 days notice: 50% of total fee due</li>
          <li>Less than 14 days: 100% of total fee due</li>
        </ul>
      </li>
      
      <li><strong>WEATHER/FORCE MAJEURE:</strong> Outdoor events subject to weather conditions. Indoor alternative venue or postponement options should be discussed in advance.</li>
      
      <li><strong>RECORDING RIGHTS:</strong> Event organizer may record performance for promotional use. Commercial distribution requires separate agreement and compensation.</li>
      
      <li><strong>LIABILITY & INSURANCE:</strong> Event organizer provides general liability coverage for venue and attendees. Performer responsible for personal equipment insurance.</li>
      
      <li><strong>TECHNICAL DIFFICULTIES:</strong> Performance time may be adjusted due to technical issues beyond performer's control without penalty.</li>
      
      <li><strong>DISPUTE RESOLUTION:</strong> Event-related disputes resolved through mediation, then binding arbitration in the jurisdiction of the event location.</li>
    </ol>
  </div>
</div>

${booking.notes ? `
<!-- Additional Notes -->
<div style="margin-bottom: 30px;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">EVENT NOTES</h2>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
    ${booking.notes}
  </div>
</div>
` : ''}

<!-- Signature Section -->
<div style="margin-top: 40px; page-break-inside: avoid;">
  <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">AGREEMENT EXECUTION</h2>
  
  <p style="margin: 20px 0; font-style: italic;">
    By signing below, both parties acknowledge they have read, understood, and agree to be bound by all terms and conditions of this event performance agreement.
  </p>
  
  <div style="display: flex; gap: 60px; margin-top: 40px;">
    <div style="flex: 1;">
      <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 40px;"></div>
      <p style="margin: 5px 0; font-weight: bold;">${talent.firstName} ${talent.lastName} (Performer)</p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">Date: _______________</p>
    </div>
    
    <div style="flex: 1;">
      <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 40px;"></div>
      <p style="margin: 5px 0; font-weight: bold;">${client.firstName} ${client.lastName} (Event Organizer)</p>
      <p style="margin: 5px 0; font-size: 12px; color: #666;">Date: _______________</p>
    </div>
  </div>
  
  <div style="margin-top: 30px; padding: 15px; background: #f1f3f4; border-radius: 5px; font-size: 12px; color: #666;">
    <p style="margin: 0; text-align: center;">
      <strong>This is a legally binding agreement.</strong> Please read all terms carefully before signing. 
      Questions? Contact 5T Elite Talent at admin@5telite.com or (555) 123-4567.
    </p>
  </div>
</div>

</div>
      `;
    }
  };

  // Get all available templates
  static getAllTemplates(): ContractTemplate[] {
    return [
      this.modelingContract,
      this.actingContract,
      this.commercialContract,
      this.eventContract,
    ];
  }

  // Get template by ID
  static getTemplateById(id: string): ContractTemplate | undefined {
    return this.getAllTemplates().find(template => template.id === id);
  }

  // Get templates by category
  static getTemplatesByCategory(category: string): ContractTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  // Generate contract content using specified template
  static generateContractFromTemplate(templateId: string, data: ContractData): string {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID '${templateId}' not found`);
    }
    return template.generateContent(data);
  }
}
