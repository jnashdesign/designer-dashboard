export default function Step1({ next, update }) {
  const handleSubmit = () => {
    update({ businessName: 'ExampleCo', description: 'We make things better' });
    next();
  };

  return (
    <div className="container">
      <h2>What’s the name of your business?</h2>
      <input placeholder="Business Name" />
      <h3>In one sentence, what do you do?</h3>
      <input placeholder="We help people..." />
      <button onClick={handleSubmit}>Next</button>
    </div>
  );
}