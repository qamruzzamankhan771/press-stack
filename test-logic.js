const cheerio = require('cheerio');
const { generateFields } = require('./lib/fieldGenerator');
const { generatePHP } = require('./lib/phpGenerator');

const html = `
<section class="pricing">
  <div class="plan">
    <h3>Starter</h3>
    <p>$19/mo</p>
    <ul class="features">
      <li>Email Support</li>
      <li>1 Website</li>
    </ul>
    <a href="#">Buy Now</a>
  </div>

  <div class="plan">
    <h3>Pro</h3>
    <p>$49/mo</p>
    <ul class="features">
      <li>Priority Support</li>
      <li>5 Websites</li>
      <li>Analytics</li>
    </ul>
    <a href="#">Buy Now</a>
  </div>
</section>
`;

try {
    const $ = cheerio.load(html);
    console.log('--- STEP 1: FIELD GENERATION ---');
    const fields = generateFields($);
    console.log(JSON.stringify(fields, null, 2));

    console.log('\n--- STEP 2: PHP GENERATION ---');
    const php = generatePHP(html, fields, 'Pricing Template');
    console.log(php);
} catch (error) {
    console.error('CRASH DETECTED:', error);
    process.exit(1);
}
