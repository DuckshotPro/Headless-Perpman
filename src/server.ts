import express, { Request, Response } from 'express';
import { exportApi, ExportedConversation, ApiExportOptions } from './api';

const app = express();
const port = 3000;

app.get('/export', async (req: Request, res: Response) => {
  const email = req.query.email as string;
  const userDataDir = req.query.userDataDir as string | undefined;

  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required.' });
  }

  const options: ApiExportOptions = { email };
  if (userDataDir) {
    options.userDataDir = userDataDir;
    console.log(`Received export request for email: ${email} with userDataDir: ${userDataDir}`);
  } else {
    console.log(`Received export request for email: ${email}`);
  }

  try {
    const exportedData: ExportedConversation[] = await exportApi(options);
    console.log(`Successfully exported ${exportedData.length} conversations.`);
    res.status(200).json(exportedData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(`Export failed for email ${email}:`, errorMessage);
    res.status(500).json({ error: 'Failed to export conversations.', details: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Perplexport API server listening on http://localhost:${port}`);
  console.log('To use, open your browser or API client to:');
  console.log(`http://localhost:${port}/export?email=your-email@example.com`);
  console.log('Optionally, provide a user data directory:');
  console.log(`http://localhost:${port}/export?email=your-email@example.com&userDataDir=C:\\Users\\YourUser\\AppData\\Local\\Google\\Chrome\\User Data`);
});
