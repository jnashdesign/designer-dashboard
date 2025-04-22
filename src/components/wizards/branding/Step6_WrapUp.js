import { useNavigate, useParams } from 'react-router-dom';
import { saveWizardAnswers } from '../../../firebase/saveWizardAnswers';

export default function Step6({ back, update, data }) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async () => {

    console.log("projectId:", projectId);
    console.log("data:", data);

    try {
      // Save the collected form data
      await saveWizardAnswers(projectId, data);

      // Update state
      update({ submitted: true });

      alert("Thanks! We'll review your answers and follow up soon.");
      navigate('/dashboard');
    } catch (err) {
      console.error("Error saving submission:", err);
      alert("Something went wrong saving your answers.");
    }
  };

  return (
    <div className="container">
      <h2>You're all set!</h2>
      <p>Thanks for sharing all this info—it really helps us tailor the design to your vision.</p>
      <p>If there’s anything else you’d like us to know, you can add it below:</p>
      <textarea
        rows="4"
        cols="50"
        placeholder="Any final notes?"
        onBlur={(e) => update({ finalNotes: e.target.value })}
        style={{ display: 'block', marginTop: '0.5em' }}
      />
      <div style={{ marginTop: '1em' }}>
        <button onClick={back}>Back</button>
        <button onClick={handleSubmit}>Finish</button>
      </div>
    </div>
  );
}
