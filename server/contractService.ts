import jsPDF from 'jspdf';
import { Contract, Booking, User, TalentProfile, InsertContract, contracts, signatures } from '@shared/schema';
import { db } from './db';
import { eq, exists } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export interface ContractData {
  booking: Booking;
  talent: User;
  talentProfile?: TalentProfile;
  client: User;
}

export class ContractService {
  /**
   * Generate contract content from booking data
   */
  static generateContractContent(data: ContractData): string {
    const { booking, talent, talentProfile, client } = data;
    
    const content = `
TALENT ENGAGEMENT AGREEMENT

Agreement Number: ${booking.code}
Date: ${new Date().toLocaleDateString()}

PARTIES:
Client: ${client.firstName} ${client.lastName}
Email: ${client.email}

Talent: ${talent.firstName} ${talent.lastName}
Stage Name: ${talentProfile?.stageName || 'N/A'}
Email: ${talent.email}
Phone: ${talent.phone || 'N/A'}

PROJECT DETAILS:
Title: ${booking.title}
Location: ${booking.location || 'TBD'}
Start Date: ${new Date(booking.startDate).toLocaleDateString()}
End Date: ${new Date(booking.endDate).toLocaleDateString()}
Rate: $${booking.rate || 'TBD'}

SCOPE OF WORK:
${booking.deliverables || 'To be determined based on project requirements.'}

USAGE RIGHTS:
${booking.usage ? JSON.stringify(booking.usage, null, 2) : 'Standard usage rights apply.'}

TERMS AND CONDITIONS:

1. ENGAGEMENT: Talent agrees to provide professional services as outlined above.

2. COMPENSATION: Payment shall be made according to the agreed rate and schedule.

3. PROFESSIONAL CONDUCT: Talent shall maintain professional standards and arrive punctually to all scheduled activities.

4. CANCELLATION: Either party may cancel with 24-hour notice, subject to applicable cancellation fees.

5. USAGE RIGHTS: Client shall have the rights specified in the usage section above.

6. CONFIDENTIALITY: Both parties agree to maintain confidentiality regarding project details.

7. LIABILITY: Each party shall be responsible for their own actions and insurance coverage.

8. GOVERNING LAW: This agreement shall be governed by applicable local laws.

ADDITIONAL NOTES:
${booking.notes || 'No additional notes.'}

By signing below, both parties agree to the terms and conditions outlined in this agreement.

Talent Signature: _________________________ Date: _____________

Client Signature: _________________________ Date: _____________

This is a legally binding agreement. Please read carefully before signing.
    `.trim();

    return content;
  }

  /**
   * Generate PDF contract
   */
  static generateContractPDF(contractContent: string, title: string): Buffer {
    const doc = new jsPDF();
    
    // Set title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 20);
    
    // Set content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Split content into lines that fit the page width
    const lines = doc.splitTextToSize(contractContent, 170);
    doc.text(lines, 20, 35);
    
    // Return PDF as buffer
    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Create contract for a booking talent
   */
  static async createContract(
    bookingId: string,
    bookingTalentId: string,
    createdBy: string,
    contractData: ContractData
  ): Promise<Contract> {
    const content = this.generateContractContent(contractData);
    const title = `Contract - ${contractData.booking.title}`;
    
    // Generate PDF (in a real implementation, you'd save this to object storage)
    const pdfBuffer = this.generateContractPDF(content, title);
    const pdfUrl = `/contracts/${nanoid()}.pdf`; // This would be the actual file path/URL
    
    // Create contract in database
    const [contract] = await db.insert(contracts).values({
      bookingId,
      bookingTalentId,
      title,
      content,
      pdfUrl,
      status: 'draft',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy,
    }).returning();

    return contract;
  }

  /**
   * Send contract to talent for signing
   */
  static async sendContractForSigning(contractId: string): Promise<Contract> {
    const [contract] = await db.update(contracts)
      .set({ 
        status: 'sent',
        updatedAt: new Date()
      })
      .where(eq(contracts.id, contractId))
      .returning();

    // Create signature record for the talent
    await db.insert(signatures).values({
      contractId,
      signerId: '', // This would be populated with the talent's user ID
      status: 'pending',
    });

    return contract;
  }

  /**
   * Sign contract
   */
  static async signContract(
    contractId: string,
    signerId: string,
    signatureImageUrl: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    // Update signature record
    await db.update(signatures)
      .set({
        signatureImageUrl,
        ipAddress,
        userAgent,
        status: 'signed',
        signedAt: new Date(),
      })
      .where(eq(signatures.contractId, contractId));

    // Update contract status
    await db.update(contracts)
      .set({ 
        status: 'signed',
        updatedAt: new Date()
      })
      .where(eq(contracts.id, contractId));
  }

  /**
   * Get contract with signatures
   */
  static async getContractWithSignatures(contractId: string) {
    return await db.query.contracts.findFirst({
      where: (contracts, { eq }) => eq(contracts.id, contractId),
      with: {
        signatures: {
          with: {
            signer: true,
          },
        },
        booking: true,
        bookingTalent: {
          with: {
            talent: true,
          },
        },
      },
    });
  }

  /**
   * Get contracts for a booking
   */
  static async getContractsForBooking(bookingId: string) {
    return await db.query.contracts.findMany({
      where: (contracts, { eq }) => eq(contracts.bookingId, bookingId),
      with: {
        signatures: {
          with: {
            signer: true,
          },
        },
        bookingTalent: {
          with: {
            talent: true,
          },
        },
      },
    });
  }

  /**
   * Get contracts for a talent
   */
  static async getContractsForTalent(talentId: string) {
    return await db.query.contracts.findMany({
      where: (contractsTable, { exists: existsOp, eq: eqOp }) => 
        existsOp(
          db.select().from(signatures)
            .where(eqOp(signatures.signerId, talentId))
            .where(eqOp(signatures.contractId, contractsTable.id))
        ),
      with: {
        signatures: {
          with: {
            signer: true,
          },
        },
        booking: true,
        bookingTalent: {
          with: {
            talent: true,
          },
        },
      },
    });
  }
}