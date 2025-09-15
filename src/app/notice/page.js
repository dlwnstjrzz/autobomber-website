export default function NoticePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-primary mb-8">공지사항</h1>
        <div className="bg-card text-card-foreground rounded-lg p-6">
          <p className="text-lg">공지사항 페이지입니다.</p>
        </div>
      </div>
    </div>
  );
}