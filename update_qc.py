import re

with open('src/components/QcReportsComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Helper function isSampleCert
is_sample_code = '''
export const isSampleCert = (rec?: Partial<QcReportRecord> | null): boolean => {
  if (!rec) return false;
  const po = (rec.customerPoNum || '').toUpperCase();
  const inv = (rec.invoiceNum || '').toUpperCase();
  const wo = (rec.workOrderNum || '').toUpperCase();
  const cert = (rec.certNo || '').toUpperCase();
  const issue = (rec.issueNo || '').toUpperCase();
  return po.includes('SAMPLE') || inv.includes('SAMPLE') || wo.includes('SAMPLE') || cert.includes('SAMPLE') || issue.includes('SAMPLE');
};
'''

# Find place to insert isSampleCert before component or at top of helper section
if 'export const isSampleCert' not in content:
    content = content.replace(
        'export const QcReportsComponent: React.FC = () => {',
        is_sample_code + '\nexport const QcReportsComponent: React.FC = () => {'
    )

print('Added isSampleCert helper')

with open('src/components/QcReportsComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
