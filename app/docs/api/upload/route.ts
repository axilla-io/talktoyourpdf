import { NextRequest, NextResponse } from 'next/server';
import { CONVERTERS } from 'axgen';
// import { CONVERTERS, Pinecone, TextSplitter, OpenAIEmbedder } from 'axgen';
// import { getEnvOrThrow } from '@/lib/utils';
import { Readable } from 'stream';

// function zip<T1, T2>(l1: Array<T1>, l2: Array<T2>): Array<[T1, T2]> {
//   if (l1.length !== l2.length) {
//     throw new Error('Cannot zip two lists of unequal length');
//   }
//
//   return l1.map((item, i) => [item, l2[i]]);
// }
// const store = new Pinecone({
//   index: getEnvOrThrow('PINECONE_INDEX'),
//   namespace: getEnvOrThrow('PINECONE_NAMESPACE'),
//   apiKey: getEnvOrThrow('PINECONE_API_KEY'),
//   environment: getEnvOrThrow('PINECONE_ENVIRONMENT'),
// });

/**
 * POST /docs/api/upload
 *  Receive a pdf file, chunk it, get embeddings, and store it into pinecone
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as unknown as Readable;
  const filename = formData.get('filename');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Error reading file' }, { status: 400 });
  }

  const chunks: Buffer[] = [];
  // @ts-ignore (not sure why it complains)
  for await (const chunk of file.stream()) {
    chunks.push(chunk as Buffer);
  }
  const fileContentBuffer = Buffer.concat(chunks);
  const doc = await CONVERTERS.pdf(fileContentBuffer, { url: `file://${filename}` });
  return NextResponse.json({ content: doc }, { status: 200 });

  // try {
  //   const splitter = new TextSplitter({ chunkSize: 1000, chunkOverlap: 0 });
  //   const embedder = new OpenAIEmbedder();
  //
  //   const chunks = await splitter.split(doc);
  //   const embeddings = await embedder.embed(chunks.map((chunk) => chunk.text));
  //
  //   const chunksWithEmbeddings = zip(chunks, embeddings).map(([chunk, embeddings]) => ({
  //     ...chunk,
  //     embeddings,
  //   }));
  //
  //   await store.add(chunksWithEmbeddings);
  //
  //   const count = chunks.length;
  //
  //   return NextResponse.json({ chunkCount: count, doc }, { status: 200 });
  // } catch {
  //   return NextResponse.json({ error: 'Error ingesting file' }, { status: 400 });
  // }
}