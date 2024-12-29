import RoomProvider from '@/components/RoomProvider';
import { auth } from '@clerk/nextjs/server';

async function DocLayout({ children, params}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {

  const id = (await params).id
  
  auth.protect();  // This checks if the user is authenticated

  return (
    <RoomProvider roomId={id}>{children}</RoomProvider>
  );
}

export default DocLayout;
