import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components';

interface BookingRequestEmailProps {
  listerName: string;
  hirerName: string;
  productTitle: string;
  startDate: string;
  endDate: string;
  listerPayout: number;
  dashboardUrl: string;
}

export default function BookingRequestEmail({
  listerName,
  hirerName,
  productTitle,
  startDate,
  endDate,
  listerPayout,
  dashboardUrl,
}: BookingRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New booking request for {productTitle}</Preview>
      <Body style={{ backgroundColor: '#f5f5f0', fontFamily: 'Inter, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e5e0' }}>
          {/* Header */}
          <Section style={{ backgroundColor: '#3b4fd8', padding: '32px 40px' }}>
            <Heading style={{ color: '#ffffff', fontSize: '28px', margin: 0, fontWeight: '900' }}>
              Odd Folk
            </Heading>
          </Section>

          {/* Body */}
          <Section style={{ padding: '40px' }}>
            <Heading style={{ color: '#2d1b2e', fontSize: '22px', marginBottom: '8px' }}>
              New booking request, {listerName}!
            </Heading>
            <Text style={{ color: '#2d1b2e', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              <strong>{hirerName}</strong> wants to hire your <strong>{productTitle}</strong>.
            </Text>

            <Section style={{ backgroundColor: '#f5f5f0', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
              <Text style={{ color: '#2d1b2e', fontSize: '14px', margin: '4px 0' }}>
                <strong>Dates:</strong> {startDate} – {endDate}
              </Text>
              <Text style={{ color: '#2d1b2e', fontSize: '14px', margin: '4px 0' }}>
                <strong>Your payout:</strong> £{listerPayout.toFixed(2)}
              </Text>
            </Section>

            <Text style={{ color: '#2d1b2e', fontSize: '15px', marginBottom: '28px' }}>
              Log in to your dashboard to approve or decline this request.
            </Text>

            <Button
              href={dashboardUrl}
              style={{ backgroundColor: '#f47c20', color: '#ffffff', borderRadius: '100px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              View booking request
            </Button>
          </Section>

          <Hr style={{ borderColor: '#e5e5e0', margin: '0 40px' }} />
          <Section style={{ padding: '24px 40px' }}>
            <Text style={{ color: '#999', fontSize: '12px', margin: 0 }}>
              You received this email because you have a listing on Odd Folk. Questions? Reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
