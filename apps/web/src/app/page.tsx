import { EventSearch } from '../components/EventSearch/EventSearch';

export default function HomePage() {
  return (
    <main
      style={{
        flex: 1,
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <EventSearch />
    </main>
  );
}
