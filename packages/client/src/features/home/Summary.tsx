import { useEffect, useState } from 'react'
import { usePostStore } from '../../store/postStore'
import { getImages } from '../../services/images'

export default function Summary() {
  const total = usePostStore((state) => state.total)
  const [photoCount, setPhotoCount] = useState(0)

  useEffect(() => {
    getImages({ page: 1, limit: 1 })
      .then((res) => setPhotoCount(res.total))
      .catch(() => setPhotoCount(0))
  }, [])

  return (
    <div className="mt-5">
      <hr className="summary-divider" />
      <div className="flex summary-stat py-1 justify-between">
        <div className="w-6/12">
          게시글 <span className="summary-stat-value">{total}</span>
        </div>
        <div className="w-6/12">
          사진 <span className="summary-stat-value">{photoCount}</span>
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
