import {
  Body, Button, Container, Head, Heading, Hr, Html, Img,
  Preview, Section, Text,
} from '@react-email/components';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oddfolk.co.uk';

interface BookingStatusEmailProps {
  recipientName: string;
  heading: string;
  body: string;
  detail?: string;
  ctaText: string;
  ctaUrl: string;
}

export default function BookingStatusEmail({
  recipientName,
  heading,
  body,
  detail,
  ctaText,
  ctaUrl,
}: BookingStatusEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{heading}</Preview>
      <Body style={{ backgroundColor: '#f5f5f0', fontFamily: 'Inter, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e5e0' }}>
          {/* Header */}
          <Section style={{ backgroundColor: '#3b4fd8', padding: '24px 40px' }}>
            <Img
              src={`${SITE_URL}/oddfolk_logo_email.png`}
              alt="Odd Folk"
              height={48}
              style={{ display: 'block' }}
            />
          </Section>

          {/* Body */}
          <Section style={{ padding: '40px' }}>
            <Heading style={{ color: '#2d1b2e', fontSize: '22px', marginBottom: '8px' }}>
              {heading}, {recipientName}
            </Heading>
            <Text style={{ color: '#2d1b2e', fontSize: '16px', lineHeight: '1.6', marginBottom: detail ? '16px' : '28px' }}>
              {body}
            </Text>

            {detail && (
              <Section style={{ backgroundColor: '#f5f5f0', borderRadius: '12px', padding: '16px 24px', marginBottom: '28px' }}>
                <Text style={{ color: '#2d1b2e', fontSize: '14px', margin: 0 }}>{detail}</Text>
              </Section>
            )}

            <Button
              href={ctaUrl}
              style={{ backgroundColor: '#f47c20', color: '#ffffff', borderRadius: '100px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              {ctaText}
            </Button>
          </Section>

          <Hr style={{ borderColor: '#e5e5e0', margin: '0 40px' }} />
          <Section style={{ padding: '24px 40px' }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: 0 }}>
              You received this email because you have an account on Odd Folk.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
