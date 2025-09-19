"use client";

export default function NoticesPage() {
  // 공지사항 더미 데이터 (실제로는 API나 CMS에서 가져올 예정)
  const notices = [
    {
      id: 1,
      title: "자동화 폭격기 v2.0 업데이트 안내",
      date: "2024.01.15",
      isNew: true,
      category: "업데이트",
      url: "https://example.com/notice/1"
    },
    {
      id: 2,
      title: "서비스 점검 안내 (1월 20일 02:00 ~ 04:00)",
      date: "2024.01.10",
      isNew: true,
      category: "점검",
      url: "https://example.com/notice/2"
    },
    {
      id: 3,
      title: "신규 기능 '자동 댓글 관리' 추가",
      date: "2024.01.05",
      isNew: false,
      category: "기능",
      url: "https://example.com/notice/3"
    },
    {
      id: 4,
      title: "1월 할인 이벤트 시작 (최대 50% 할인)",
      date: "2024.01.01",
      isNew: false,
      category: "이벤트",
      url: "https://example.com/notice/4"
    },
    {
      id: 5,
      title: "고객센터 운영시간 변경 안내",
      date: "2023.12.28",
      isNew: false,
      category: "안내",
      url: "https://example.com/notice/5"
    },
    {
      id: 6,
      title: "연말연시 서비스 운영 안내",
      date: "2023.12.25",
      isNew: false,
      category: "안내",
      url: "https://example.com/notice/6"
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      '업데이트': 'bg-blue-100 text-blue-700',
      '점검': 'bg-red-100 text-red-700',
      '기능': 'bg-green-100 text-green-700',
      '이벤트': 'bg-purple-100 text-purple-700',
      '안내': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const handleNoticeClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-center mb-4">공지사항</h1>
          <p className="text-center text-muted-foreground">
            최신 업데이트와 중요한 안내사항을 확인하세요
          </p>
        </div>

        {/* 공지사항 리스트 */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => handleNoticeClick(notice.url)}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* 카테고리 배지 */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                        {notice.category}
                      </span>

                      {/* NEW 배지 */}
                      {notice.isNew && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* 제목 */}
                    <h3 className="text-lg font-semibold text-card-foreground group-hover:text-blue-600 transition-colors mb-2">
                      {notice.title}
                    </h3>

                    {/* 날짜 */}
                    <p className="text-sm text-muted-foreground">
                      {notice.date}
                    </p>
                  </div>

                  {/* 화살표 아이콘 */}
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 더보기 버튼 (필요시) */}
          <div className="text-center mt-12">
            <button className="border border-border px-6 py-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-accent-foreground">
              더 많은 공지사항 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}