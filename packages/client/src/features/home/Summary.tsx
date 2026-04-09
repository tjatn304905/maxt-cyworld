export default function Summary() {
  return (
    <div className="mt-5">
      <hr className="summary-divider" />
      <div className="flex summary-stat py-1 justify-between">
        <div className="w-6/12">
          다이어리 <span className="summary-stat-value">0/65</span>
        </div>
        <div className="w-6/12">
          사진첩 <span className="summary-stat-value">0/265</span>
        </div>
      </div>
      <hr className="summary-divider" />
      <div className="flex summary-stat py-1 justify-between">
        <div className="w-6/12">
          게시판 <span className="summary-stat-value">0/15</span>
        </div>
        <div className="w-6/12">
          방명록 <span className="summary-stat-value">0/15</span>
        </div>
      </div>
      <hr className="summary-divider" />
      <div className="flex summary-stat py-1 justify-between invisible">
        <div>게시판 0/15</div>
        <div>방명록 0/15</div>
      </div>
      <hr className="summary-divider" />
    </div>
  )
}
