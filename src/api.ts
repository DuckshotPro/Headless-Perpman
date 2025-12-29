import puppeteer from "puppeteer-extra";
import { Browser, LaunchOptions } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ConversationSaver } from "./ConversationSaver";
import { getConversations } from "./listConversations";
import renderConversation from "./renderConversation";
import { sleep } from "./utils";

export interface ApiExportOptions {
  email: string; // Keep email for potential future use, though login is removed
  userDataDir?: string;
}

export interface ExportedConversation {
  id: string;
  markdown: string;
  json: any;
}

export async function exportApi(options: ApiExportOptions): Promise<ExportedConversation[]> {
  puppeteer.use(StealthPlugin());

  const launchOptions: LaunchOptions = {
    headless: true,
  };

  if (options.userDataDir) {
    launchOptions.userDataDir = options.userDataDir;
  }

  const browser: Browser = await puppeteer.launch(launchOptions);

  const exportedData: ExportedConversation[] = [];

  try {
    const page = await browser.newPage();

    // The login call is removed. We rely on the user providing a userDataDir
    // with an active session. If no session exists, this will likely fail
    // at the getConversations step.
    
    // For an API, we get all conversations.
    const conversations = await getConversations(page, { processedUrls: [] });

    const conversationSaver = new ConversationSaver(page);
    await conversationSaver.initialize();

    for (const conversation of conversations) {
      const threadData = await conversationSaver.loadThreadFromURL(
        conversation.url
      );

      const markdown = renderConversation(threadData.conversation);
      
      exportedData.push({
        id: threadData.id,
        markdown: markdown,
        json: threadData.conversation
      });

      await sleep(2000); // don't do it too fast
    }
  } catch (error) {
    console.error("An error occurred during API export:", error);
    throw error;
  } finally {
    await browser.close();
  }

  return exportedData;
}
