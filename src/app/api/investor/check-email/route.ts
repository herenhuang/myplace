import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// A simple CSV line parser that handles quoted fields
function parseCsvLine(line: string): string[] {
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    return line.split(regex).map(field => {
        // Remove quotes from start and end of the field
        const trimmedField = field.trim();
        if (trimmedField.startsWith('"') && trimmedField.endsWith('"')) {
            return trimmedField.slice(1, -1);
        }
        return trimmedField;
    });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const filePath = path.join(process.cwd(), 'public', 'investor_list.csv');

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const lines = fileContent.split('\n');
      
      console.log(`✅ [Investor Check] Successfully loaded investor_list.csv. Found ${lines.length - 1} records.`);

      // Find the matching investor row, skipping the header
      const investorRow = lines.slice(1).find(line => {
          const columns = parseCsvLine(line);
          const emailInRow = columns[3]?.toLowerCase().trim();
          return emailInRow === normalizedEmail;
      });

      if (investorRow) {
          const columns = parseCsvLine(investorRow);
          const customMessage = columns[6]?.trim();
          const name = columns[5]?.trim();
          
          let welcomeMessage = `Welcome! Thanks for joining. Your simulation will begin shortly.`;
          if (customMessage) {
            welcomeMessage = customMessage;
          } else if (name) {
            welcomeMessage = `Welcome, ${name}! Your simulation will begin shortly.`
          }

          return NextResponse.json({ success: true, message: welcomeMessage });
      } else {
        return NextResponse.json({ success: false, message: 'Email not found in investor list' }, { status: 404 });
      }
    } catch (error) {
      console.error('Error reading investor list:', error);
      if (error.code === 'ENOENT') {
        return NextResponse.json({ success: false, message: 'Investor list not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Internal server error while checking email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Fatal error in check-email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
