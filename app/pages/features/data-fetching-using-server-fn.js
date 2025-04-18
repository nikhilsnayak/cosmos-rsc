import { Comments } from '../../components/comments';
import { getComments } from '../../functions/get-comments';

export default function DataFetchingUsingServerFn() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Data Fetching Using Server Function</h1>
      <p className="text-lg text-gray-600 mb-8">This is a demonstration of data fetching using server functions.</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <Comments getComments={getComments} />
      </div>
    </div>
  );
}
