import {
  Body, Container, Head, Heading, Hr, Html, Img,
  Preview, Section, Text,
} from '@react-email/components';

const SITE_URL = process.env.BETTER_AUTH_URL || 'https://oddfolk.co.uk';

interface ContactConfirmationEmailProps {
  name: string;
  subject: string;
}

export default function ContactConfirmationEmail({ name, subject }: ContactConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>We've received your message</Preview>
      <Body style={{ backgroundColor: '#f5f5f0', fontFamily: 'Inter, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e5e0' }}>
          <Section style={{ backgroundColor: '#3b4fd8', padding: '24px 40px' }}>
            <Img
              src={`${SITE_URL}/oddfolk_logo_email.png`}
              alt="Odd Folk"
              height={48}
              style={{ display: 'block' }}
            />
          </Section>

          <Section style={{ padding: '40px' }}>
            <Heading style={{ color: '#2d1b2e', fontSize: '22px', marginBottom: '8px' }}>
              Thanks for reaching out, {name}
            </Heading>
            <Text style={{ color: '#2d1b2e', fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
              We've received your message about <strong>{subject}</strong> and will get back to you within 48 hours.
            </Text>
            <Text style={{ color: '#2d1b2e', fontSize: '16px', lineHeight: '1.6', marginBottom: '0' }}>
              In the meantime, you might find an answer to your question in our FAQ.
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e5e5e0', margin: '0 40px' }} />
          <Section style={{ padding: '24px 40px' }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: 0 }}>
              You received this email because you submitted a contact form on Odd Folk.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
