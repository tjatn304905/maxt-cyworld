import PixelAvatar from '../../components/ui/PixelAvatar'
import { TEAM } from './data'

export default function MiniroomView() {
  return (
    <div className="miniroom-container h-[320px] relative">
      {/* Wall */}
      <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-[#e0eef8] to-[#d0e4f0]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #99ccff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Wall Frame */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white p-1.5 border-2 border-[#aa8866] rounded shadow-md">
          <div className="bg-cy-blue-light border border-cy-blue p-2 text-center">
            <div className="text-[11px] font-bold">📸 우리 팀 단체사진</div>
            <div className="flex justify-center gap-1 mt-1">
              {TEAM.slice(0, 5).map((m) => (
                <div
                  key={m.name}
                  className="w-4 h-4 rounded-full border border-white"
                  style={{ backgroundColor: m.head === 'crown' ? '#ffd700' : '#99ccff' }}
                />
              ))}
            </div>
            <div className="text-[9px] text-cy-text-light mt-1">2024 Team Photo</div>
          </div>
        </div>

        {/* Window */}
        <div className="absolute top-6 right-8 w-12 h-14 bg-[#aaddff] border-2 border-[#887766] rounded-sm">
          <div className="absolute inset-0 border border-white/40" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#887766]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#887766]" />
        </div>

        {/* Clock */}
        <div className="absolute top-6 left-8 w-10 h-10 bg-white border-2 border-[#887766] rounded-full flex items-center justify-center">
          <div className="text-[8px] font-bold">🕐</div>
        </div>
      </div>

      {/* Floor */}
      <div className="miniroom-floor" />

      {/* Bookshelf */}
      <div className="absolute bottom-[30%] left-[5%] w-[50px] h-[60px]">
        <div className="w-full h-full bg-[#aa8866] border border-[#886644] rounded-sm relative">
          <div className="absolute top-[15%] left-[10%] right-[10%] h-[2px] bg-[#886644]" />
          <div className="absolute top-[45%] left-[10%] right-[10%] h-[2px] bg-[#886644]" />
          <div className="absolute top-[75%] left-[10%] right-[10%] h-[2px] bg-[#886644]" />
          <div className="absolute top-[5%] left-[15%] w-[12px] h-[10px] bg-[#ff9999]" />
          <div className="absolute top-[5%] left-[55%] w-[8px] h-[10px] bg-[#99ccff]" />
          <div className="absolute top-[35%] left-[20%] w-[10px] h-[10px] bg-[#99ff99]" />
          <div className="absolute top-[65%] left-[30%] w-[15px] h-[10px] bg-[#ffcc99]" />
        </div>
      </div>

      {/* Plant */}
      <div className="absolute bottom-[28%] right-[8%]">
        <div className="text-[24px]">🪴</div>
      </div>

      {/* Team Members */}
      {TEAM.map((member) => (
        <div
          key={member.name}
          className="absolute flex flex-col items-center group"
          style={{ left: `${member.x}%`, top: `${member.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <PixelAvatar
            size={36}
            head={member.head}
            body={member.body}
            accessory={member.accessory}
          />
          <div className="text-[9px] mt-0.5 bg-white/80 px-1 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity">
            {member.name}
          </div>
        </div>
      ))}

      {/* Rug */}
      <div
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[120px] h-[30px] rounded-full opacity-40"
        style={{ background: 'radial-gradient(ellipse, #ffccaa, #ffddbb)' }}
      />
    </div>
  )
}
