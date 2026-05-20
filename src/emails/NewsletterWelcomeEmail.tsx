import {
  Body, Button, Container, Head, Heading, Hr, Html, Img,
  Preview, Section, Text,
} from '@react-email/components';

const SITE_URL = process.env.BETTER_AUTH_URL || 'https://oddfolk.co.uk';

interface NewsletterWelcomeEmailProps {
  unsubscribeUrl: string;
}

export default function NewsletterWelcomeEmail({ unsubscribeUrl }: NewsletterWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Thanks for signing up — we'll keep you updated as we head to launch.</Preview>
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
              Thanks for signing up!
            </Heading>
            <Text style={{ color: '#2d1b2e', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              We're so excited you're here. We're looking forward to going live soon — and in the meantime, we'll keep you updated as we progress towards launch.
            </Text>
            <Text style={{ color: '#2d1b2e', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
              Odd Folk is London's peer-to-peer marketplace for event furniture and styling props. Watch this space.
            </Text>

            <Button
              href={`${SITE_URL}`}
              style={{ backgroundColor: '#f47c20', color: '#ffffff', borderRadius: '100px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Learn more
            </Button>
          </Section>

          <Hr style={{ borderColor: '#e5e5e0', margin: '0 40px' }} />
          <Section style={{ padding: '24px 40px' }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: 0 }}>
              You received this email because you subscribed to Odd Folk updates.{' '}
              <a href={unsubscribeUrl} style={{ color: '#999', textDecoration: 'underline' }}>Unsubscribe</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
