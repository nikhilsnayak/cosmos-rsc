import { Toaster } from '../components/toster';
import { addPost } from '../functions/add-post';

export default function FlashMessagesPage() {
  return (
    <section>
      <Toaster />
      <form action={addPost}>
        <div>
          <label htmlFor='title'>Title</label>
          <input type='text' name='title' id='title' />
        </div>
        <div>
          <label htmlFor='content'>Content</label>
          <textarea name='content' id='content'></textarea>
        </div>
        <button>Add</button>
      </form>
    </section>
  );
}
