import { useAvatarStore } from '../../store/avatarStore'
import PixelAvatar from '../../components/ui/PixelAvatar'

export default function AvatarBuilder() {
  const { head, body, accessory, cycleHead, cycleBody, cycleAccessory } =
    useAvatarStore()

  return (
    <div className="bg-white border-2 border-dashed border-cy-gray rounded-lg p-4">
      <h3 className="text-[14px] font-bold mb-3 text-center">🧑‍🎨 미니미 만들기</h3>
      <div className="flex items-center justify-center gap-6">
        <div className="bg-cy-blue-light border-2 border-cy-blue rounded-lg p-4 flex items-center justify-center">
          <PixelAvatar size={96} head={head} body={body} accessory={accessory} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] w-[50px] text-right">머리:</span>
            <button onClick={cycleHead} className="cy-btn !text-[11px]">
              {head} ▶
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] w-[50px] text-right">몸:</span>
            <button onClick={cycleBody} className="cy-btn !text-[11px]">
              {body} ▶
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] w-[50px] text-right">악세:</span>
            <button onClick={cycleAccessory} className="cy-btn !text-[11px]">
              {accessory} ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
