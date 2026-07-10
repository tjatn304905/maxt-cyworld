// 미니미 도트 스프라이트 데이터 — 24 x 32 그리드 (도트 제작 파이프라인 산출물)
// rows: 줄번호 → 24글자 문자열('.'=투명), palette: 글자 → HEX

export interface SpriteLayer {
  palette: Record<string, string>
  rows: Record<number, string>
}

export const GRID_W = 24
export const GRID_H = 32

export const SPRITE_BASE: SpriteLayer = {
  'palette': {
    'K': '#3a2622',
    'S': '#ffdcb8',
    'D': '#f0bc92',
    'W': '#ffffff',
    'B': '#33302e'
  },
  'rows': {
    '1': '......KKKKKKKKKKKK......',
    '2': '....KKSSSSSSSSSSSSKK....',
    '3': '...KSSSSSSSSSSSSSSSSK...',
    '4': '..KSSSSSSSSSSSSSSSSSSK..',
    '5': '..KSSSSSSSSSSSSSSSSSSK..',
    '6': '..KSSSSSSSSSSSSSSSSSSK..',
    '7': '..KSSSSSSSSSSSSSSSSSSK..',
    '8': '..KSSSSSSSSSSSSSSSSSSK..',
    '9': '..KSSSSSSSSSSSSSSSSSSK..',
    '10': '..KSSSSSSSSSSSSSSSSSSK..',
    '11': '..KSSSSSSSSSSSSSSSSSSK..',
    '12': '..KSSSSSSSSSSSSSSSSSSK..',
    '13': '...KSSSSSSSSSSSSSSSSK...',
    '14': '....KKSSSSSSSSSSSSKK....',
    '15': '......KKKKKKKKKKKK......',
    '16': '....KSSSSSSSSSSSSSSK....',
    '17': '....KSSSSSSSSSSSSSSK....',
    '18': '....KSSSSSSSSSSSSSSK....',
    '19': '....KSSSSSSSSSSSSSSK....',
    '20': '....KSSSSSSSSSSSSSSK....',
    '21': '....KSSSSSSSSSSSSSSK....',
    '22': '....KSSSSSSSSSSSSSSK....',
    '23': '....KSSSSSSSSSSSSSSK....',
    '24': '......KSSSK..KSSSK......',
    '25': '......KSSSK..KSSSK......',
    '26': '......KSSSK..KSSSK......',
    '27': '......KWWWK..KWWWK......',
    '28': '.....KBBBBK..KBBBBK.....',
    '29': '.....KBBBBK..KBBBBK.....',
    '30': '......KKKK....KKKK......'
  }
}

export const SPRITE_LAYERS: Record<string, SpriteLayer> = {
  'hair:default': {'palette':{'K':'#3a2622','H':'#7a4a2b','L':'#9a6238'},'rows':{'0':'.....KKKKKKKKKKKKKK.....','1':'....KHHHHHHHHHHHHHHK....','2':'...KHHHHLLHHHHLLHHHHK...','3':'..KHHHHHHHHHHHHHHHHHHK..','4':'..KHHHHHHHHHHHHHHHHHHK..','5':'..KHHHHHHHHHHHHHHHHHHK..','6':'..KHHHHKHHKHHKHHKHHHHK..','7':'..KHHK............KHHK..','8':'..KHHK............KHHK..','9':'..KHHK............KHHK..','10':'..KHHK............KHHK..','11':'...KK..............KK...'}},
  'hair:cat': {'palette':{'K':'#3a2622','H':'#b06a30','L':'#d4894a','P':'#ff9db0'},'rows':{'0':'....KK...........KK.....','1':'...KPPPKKKKKKKKKKPPPK...','2':'...KHPPPHHHHHHHHPPPHK...','3':'..KHHHLLHHHHHHHHLLHHHK..','4':'..KHHHHHHHHHHHHHHHHHHK..','5':'..KHHHHHHHHHHHHHHHHHHK..','6':'..KHHHHHHHHHHHHHHHHHHK..','7':'..KHHHHKHHKHHKHHKHHHHK..','8':'..KHHK............KHHK..','9':'..KHHK............KHHK..','10':'..KHHK............KHHK..','11':'..KHHK............KHHK..','12':'...KK..............KK...'}},
  'hair:bear': {'palette':{'K':'#3a2622','H':'#5d4037','L':'#7a5647','E':'#e8c8a0'},'rows':{'0':'...KKKK..........KKKK...','1':'..KHEEHKKKKKKKKKKHEEHK..','2':'...KEEHHHHHHHHHHHHEEK...','3':'..KHHHLLHHHHHHHHLLHHHK..','4':'..KHHHHHHHHHHHHHHHHHHK..','5':'..KHHHHHHHHHHHHHHHHHHK..','6':'..KHHHHHHHHHHHHHHHHHHK..','7':'..KHHHHKHHKHHKHHKHHHHK..','8':'..KHHK............KHHK..','9':'..KHHK............KHHK..','10':'..KHHK............KHHK..','11':'..KHHK............KHHK..','12':'...KK..............KK...'}},
  'hair:bunny': {'palette':{'K':'#3a2622','H':'#8a5a35','W':'#ffffff','P':'#ffaebc'},'rows':{'0':'......KKK......KKK......','1':'.....KWWWKKKKKKWWWK.....','2':'.....KWPWKHHHHKWPWK.....','3':'....KKWPWKHHHHKWPWKK....','4':'...KHKWPWKHHHHKWPWKHK...','5':'..KHHKWPWKHHHHKWPWKHHK..','6':'..KHHHHHHHHHHHHHHHHHHK..','7':'..KHHHHKHHKHHKHHKHHHHK..','8':'..KHHK............KHHK..','9':'..KHHK............KHHK..','10':'..KHHK............KHHK..','11':'..KHHK............KHHK..','12':'...KK..............KK...'}},
  'hair:crown': {'palette':{'K':'#3a2622','H':'#7a4a2b','L':'#9a6238','G':'#f5c542','D':'#c9962b','R':'#e83a5f'},'rows':{'0':'......KK...KK...KK......','1':'.....KGGKKKGGKKKGGK.....','2':'....KKGGGGGRRGGGGGKK....','3':'...KHKDDDDDDDDDDDDKHK...','4':'..KHHHHHHHHHHHHHHHHHHK..','5':'..KHHHHHHHHHHHHHHHHHHK..','6':'..KHHHHHHHHHHHHHHHHHHK..','7':'..KHHHHKHHKHHKHHKHHHHK..','8':'..KHHK............KHHK..','9':'..KHHK............KHHK..','10':'..KHHK............KHHK..','11':'..KHHK............KHHK..','12':'...KK..............KK...'}},
  'hair:bob': {'palette':{'K':'#3a2622','H':'#4a3123','L':'#6b4a35'},'rows':{'0':'.....KKKKKKKKKKKKKK.....','1':'....KHHHHHHHHHHHHHHK....','2':'...KHHHHLLHHHHLLHHHHK...','3':'..KHHHHHHHHHHHHHHHHHHK..','4':'..KHHHHHHHHHHHHHHHHHHK..','5':'..KHHHHHHHHHHHHHHHHHHK..','6':'..KHHHHKHHKHHKHHKHHHHK..','7':'..KHHHK..........KHHHK..','8':'..KHHHK..........KHHHK..','9':'..KHHHK..........KHHHK..','10':'..KHHHK..........KHHHK..','11':'..KHHHK..........KHHHK..','12':'..KHHHK..........KHHHK..','13':'...KHHK..........KHHK...'}},
  'hair:ponytail': {'palette':{'K':'#3a2622','H':'#b5854a','L':'#d1a468','P':'#ff8fab'},'rows':{'0':'.....KKKKKKKKKKKKKK.....','1':'....KHHHHHHHHHHHHHHK....','2':'...KHHHHLLHHHHLLHHHHK...','3':'..KHHHHHHHHHHHHHHHHHKK..','4':'..KHHHHHHHHHHHHHHHHKPPK.','5':'..KHHHHHHHHHHHHHHHHKPPK.','6':'..KHHHHKHHKHHKHHKHHKHHK.','7':'..KHHK............KKHHHK','8':'..KHHK............KKHHHK','9':'..KHHK............KKHHHK','10':'..KHHK............KKHHHK','11':'...KK..............KKHHK','12':'....................KHHK','13':'.....................KK.'}},
  'hair:ribbon': {'palette':{'K':'#3a2622','H':'#553a29','L':'#75503a','P':'#ff9db0','M':'#e8607e'},'rows':{'0':'............KKK..KKK....','1':'.....KKKKKKKKPPMMPPK....','2':'....KHHHHHHHHHKPPKHK....','3':'...KHHHHLLHHHHLLHHHHK...','4':'..KHHHHHHHHHHHHHHHHHHK..','5':'..KHHHHHHHHHHHHHHHHHHK..','6':'..KHHHHHHHHHHHHHHHHHHK..','7':'..KHHHHKHHKHHKHHKHHHHK..','8':'..KHHK............KHHK..','9':'..KHHK............KHHK..','10':'..KHHK............KHHK..','11':'..KHHK............KHHK..','12':'...KK..............KK...'}},
  'hair:curly': {'palette':{'K':'#3a2622','H':'#7d4fa8','L':'#9a6fc4'},'rows':{'0':'.....KK....KK....KK.....','1':'....KHHHKKHHHHKKHHHK....','2':'...KHHLHHHHLLHHHHLHHK...','3':'..KHHHHHHHHHHHHHHHHHHK..','4':'.KHHHHHHHHHHHHHHHHHHHHK.','5':'.KHHHHHHHHHHHHHHHHHHHHK.','6':'.KHHLHHHHHHHHHHHHHHLHHK.','7':'..KHHHKKHHKHHKHHKKHHHK..','8':'.KHHHHK..........KHHHHK.','9':'.KHHHHK..........KHHHHK.','10':'..KHHHK..........KHHHK..','11':'..KHHHK..........KHHHK..','12':'...KHHK..........KHHK...','13':'....KK............KK....'}},
  'face:default': {'palette':{'E':'#2b1a12','W':'#ffffff','R':'#d8434e','M':'#a02832','P':'#ff9db0'},'rows':{'8':'.......WE......WE.......','9':'.......EE......EE.......','10':'.......EE......EE.......','11':'....PP....RRRR....PP....','12':'....PP...RMMMMR...PP....','13':'..........RRRR..........'}},
  'face:smile': {'palette':{'E':'#2b1a12','R':'#d8434e','M':'#a02832','P':'#ff9db0'},'rows':{'8':'.......E........E.......','9':'......E.E......E.E......','11':'....PP...R....R...PP....','12':'.........RMMMMR.........','13':'..........RRRR..........'}},
  'face:wink': {'palette':{'E':'#2b1a12','W':'#ffffff','R':'#d8434e','T':'#ff8fa8','P':'#ff9db0'},'rows':{'8':'.......WE...............','9':'.......EE......EEE......','10':'.......EE...............','11':'....PP...R....R...PP....','12':'..........RRRR..........','13':'............TT..........'}},
  'face:sleepy': {'palette':{'E':'#2b1a12','R':'#d8434e','M':'#a02832','C':'#9ad6ff'},'rows':{'9':'......EEE......EEE......','11':'..........RRR...........','12':'..........RMRC..........','13':'..........RRRCC.........','14':'..............C.........'}},
  'face:cool': {'palette':{'E':'#2b1a12','R':'#d8434e'},'rows':{'8':'......EEE......EEE......','9':'.......EE......EE.......','12':'..........RRRR..........'}},
  'face:heart': {'palette':{'H':'#ff4f8f','h':'#ffb3cf','R':'#d8434e','M':'#a02832','P':'#ff9db0'},'rows':{'8':'.....hH.HH....hH.HH.....','9':'.....HHHHH....HHHHH.....','10':'......HHH......HHH......','11':'....PP..R......R..PP....','12':'.........RMMMMR.........','13':'..........RRRR..........'}},
  'face:angry': {'palette':{'E':'#2b1a12','R':'#d8434e','V':'#e23b3b'},'rows':{'7':'...........V.V..........','8':'......EE....V...EE......','9':'.......EE..V.V.EE.......','10':'.......EE......EE.......','11':'..........RRRR..........','12':'.........R....R.........'}},
  'face:tears': {'palette':{'E':'#2b1a12','W':'#ffffff','R':'#d8434e','M':'#a02832','T':'#5db2f5'},'rows':{'8':'.......WE......WE.......','9':'.......EE......EE.......','10':'.......EE......EE.......','11':'.......T........T.......','12':'......TT..RMMR..TT......','13':'......T....RR....T......'}},
  'face:surprised': {'palette':{'E':'#2b1a12','W':'#ffffff','R':'#d8434e','M':'#a02832','C':'#9ad6ff'},'rows':{'7':'......EEE......EEE......','8':'......WWW......WWW.C....','9':'......WEW......WEWCC....','10':'......WWW......WWW......','11':'...........RR...........','12':'..........RMMR..........','13':'...........RR...........'}},
  'top:default': {'palette':{'K':'#3a2622','T':'#3b82d9','N':'#2a5fa8','W':'#ffffff'},'rows':{'15':'......KTTTTTTTTTTK......','16':'....KTTTTTTTTTTTTTTK....','17':'....KTTTTTTTTTTTTTTK....','18':'....KTTTTWWTWWTTTTTK....','19':'....KTTTTWWWWWTTTTTK....','20':'....KTTTTTWWWTTTTTTK....','21':'....KTTTTTTWTTTTTTTK....','22':'....KNNNNNNNNNNNNNNK....'}},
  'top:suit': {'palette':{'K':'#3a2622','A':'#2c3e6b','N':'#1e2b4d','W':'#ffffff','R':'#8e2a3c','M':'#671f2c'},'rows':{'15':'......KAAAWWWWAAAK......','16':'....KAAAAAWRRWAAAAAK....','17':'....KAAAAAARRAAAAAAK....','18':'....KAWWAAARRAAAAAAK....','19':'....KAAAAAAMMAAAAAAK....','20':'....KAAAAAAAAAAAAAAK....','21':'....KAAAAAAAAAAAAAAK....','22':'....KNNNNNNNNNNNNNNK....'}},
  'top:casual': {'palette':{'K':'#3a2622','C':'#f2795c','D':'#d05a40','B':'#732e1c'},'rows':{'15':'......KCCCCCCCCCCK......','16':'....KCCCCCCCCCCCCCCK....','17':'....KCCDDDCCCCCCCCCK....','18':'....KCCDDDCCCCCCCCCK....','19':'....KCCCCCCBBCCCCCCK....','20':'....KCCCCCCCCCCCCCCK....','21':'....KCCCCCCBBCCCCCCK....','22':'....KDDDDDDDDDDDDDDK....'}},
  'top:sporty': {'palette':{'K':'#3a2622','G':'#3d9e4f','N':'#2c7a3a','W':'#ffffff','Z':'#1f5c2a'},'rows':{'15':'......KGGGGZZGGGGK......','16':'....KGWWGGGZZGGGWWGK....','17':'....KGWWGGGZZGGGWWGK....','18':'....KGWWGGGZZGGGWWGK....','19':'....KGWWGGGZZGGGWWGK....','20':'....KGWWGGGZZGGGWWGK....','21':'....KGWWGGGZZGGGWWGK....','22':'....KNNNNNNNNNNNNNNK....'}},
  'top:hoodie': {'palette':{'K':'#3a2622','P':'#b9a3e3','D':'#9a82c9','W':'#ffffff'},'rows':{'14':'.....KDDK......KDDK.....','15':'....KDDDDDDDDDDDDDDK....','16':'....KPPPPPWPPWPPPPPK....','17':'....KPPPPPWPPWPPPPPK....','18':'....KPPPPPWPPWPPPPPK....','19':'....KPPPDDDDDDDDPPPK....','20':'....KPPPDPPPPPPDPPPK....','21':'....KPPPDPPPPPPDPPPK....','22':'....KDDDDDDDDDDDDDDK....'}},
  'top:shirt': {'palette':{'K':'#3a2622','W':'#ffffff','G':'#a7adb8','R':'#d0333e'},'rows':{'15':'......KGGGGRRGGGGK......','16':'....KWWWWWGRRGWWWWWK....','17':'....KWWWWWWRRWWWWWWK....','18':'....KWWWWWWRRWWWWWWK....','19':'....KWWWWWWRRWWWWWWK....','20':'....KWWWWWWWWWWWWWWK....','21':'....KWWWWWWWWWWWWWWK....','22':'....KGGGGGGGGGGGGGGK....'}},
  'top:overalls': {'palette':{'K':'#3a2622','Y':'#f4c93f','D':'#4a6da8','N':'#3a5688','G':'#f2b53a'},'rows':{'15':'......KDDYYYYYYDDK......','16':'....KYYDDYYYYYYDDYYK....','17':'....KYYDDYYYYYYDDYYK....','18':'....KYYDGDDDDDDGDYYK....','19':'....KYYDDDDDDDDDDYYK....','20':'....KYYDDDNNNNDDDYYK....','21':'....KYYDDDDDDDDDDYYK....','22':'....KNNNNNNNNNNNNNNK....'}},
  'top:stripe': {'palette':{'K':'#3a2622','W':'#ffffff','N':'#2a4d8f','G':'#d9dde3'},'rows':{'15':'......KWWWWWWWWWWK......','16':'....KWWWWWWWWWWWWWWK....','17':'....KNNNNNNNNNNNNNNK....','18':'....KWWWWWWWWWWWWWWK....','19':'....KNNNNNNNNNNNNNNK....','20':'....KWWWWWWWWWWWWWWK....','21':'....KNNNNNNNNNNNNNNK....','22':'....KGGGGGGGGGGGGGGK....'}},
  'top:hanbok': {'palette':{'K':'#3a2622','P':'#f6c7d4','W':'#ffffff','R':'#e0608a','B':'#7c8fc9','D':'#e8a8bd'},'rows':{'15':'......KPPWPPPPWPPK......','16':'....KPPPPPWPPWPPPPPK....','17':'....KPPPPPPWWPPPPPPK....','18':'....KPPPPPPRRPPPPPPK....','19':'....KBBPPPPPRRPPPBBK....','20':'....KBBPPPPPRRPPPBBK....','21':'....KBBPPPPPPPPPPBBK....','22':'....KDDDDDDDDDDDDDDK....'}},
  'bottom:default': {'palette':{'K':'#3a2622','J':'#3f6fae','N':'#2d5288'},'rows':{'23':'....KJJJJJJJJJJJJJJK....','24':'....KJJJJJJKKJJJJJJK....','25':'.....KNJJJK...KJJNK.....'}},
  'bottom:jeans': {'palette':{'K':'#3a2622','J':'#3f6fae','N':'#2d5288','L':'#7ea6d8'},'rows':{'23':'....KJJJJJJJJJJJJJJK....','24':'....KJJJJJJKKJJJJJJK....','25':'.....KNJJJK..KJJJNK.....','26':'.....KNJJJK..KJJJNK.....','27':'.....KLLLLK..KLLLLK.....'}},
  'bottom:shorts': {'palette':{'K':'#3a2622','Y':'#f2c744','D':'#d9a92c'},'rows':{'23':'....KYYYYYYYYYYYYYYK....','24':'.....KDYYYK..KYYYDK.....'}},
  'bottom:skirt': {'palette':{'K':'#3a2622','P':'#f28bb8','F':'#ffd7e8'},'rows':{'23':'....KPPPPPPPPPPPPPPK....','24':'...KPPPPPPPPPPPPPPPPK...','25':'...KFPFPFPFPFPFPFPFPK...'}},
  'bottom:training': {'palette':{'K':'#3a2622','G':'#4a4a52','D':'#38383f','W':'#ffffff'},'rows':{'23':'....KWGGGGGGGGGGGGWK....','24':'....KWGGGGGKKGGGGGWK....','25':'.....KWGGGK..KGGGWK.....','26':'.....KWGGGK..KGGGWK.....','27':'.....KWDDDK..KDDDWK.....'}},
  'bottom:checkskirt': {'palette':{'K':'#3a2622','R':'#c22f3a','D':'#8f1f2a','Y':'#e8c766'},'rows':{'23':'....KRDRRRDRRDRRRDRK....','24':'....KDYDDDYDDYDDDYDK....','25':'...KRRDRRRDRRDRRRDRRK...','26':'...KRRDRRDRRDRRDRRDRK...'}},
  'bottom:cargo': {'palette':{'K':'#3a2622','O':'#6b7a3f','P':'#93a55e'},'rows':{'23':'....KOOOOOOOOOOOOOOK....','24':'....KPPOOOOKKOOOOPPK....','25':'....KPPOOOK..KOOOPPK....'}},
  'bottom:hanbok': {'palette':{'K':'#3a2622','H':'#e34234','N':'#b52f24','G':'#e8b84b'},'rows':{'23':'....KHHHHHHHHHHHHHHK....','24':'...KNHHHHHHHHHHHHHHNK...','25':'...KGHGHGHGHGHGHGHGHK...','26':'...KNHHHHHHHHHHHHHHNK...','27':'....KGGGGGGGGGGGGGGK....'}},
  'bottom:slacks': {'palette':{'K':'#3a2622','C':'#44444c','D':'#33333a','B':'#2a2a30','G':'#e8b84b'},'rows':{'23':'....KBBBBBBGGBBBBBBK....','24':'....KCCCCCCKKCCCCCCK....','25':'......KCCCK..KCCCK......','26':'......KCCCK..KCCCK......','27':'......KDDDK..KDDDK......'}},
  'accessory:none': {'palette':{},'rows':{}},
  'accessory:glasses': {'palette':{'G':'#a8763f'},'rows':{'8':'......GGGG....GGGG......','9':'......G..GGGGGG..G......','10':'......G..G....G..G......','11':'......GGGG....GGGG......'}},
  'accessory:hat': {'palette':{'K':'#3a2622','C':'#7ec8f0','D':'#4aa3d8'},'rows':{'0':'.....KKKKKKKKKKKKKK.....','1':'....KCCCCCCCCCCCCCCK....','2':'...KCCCCCCCDDCCCCCCCK...','3':'..KCCCCCCCCCCCCCCCCCCK..','4':'..KCCCCCCCCCCCCCCCCCCKK.','5':'..KKKKKKKKKKKKDDDDDDDDDK'}},
  'accessory:scarf': {'palette':{'K':'#3a2622','P':'#f48fb1','D':'#d96a95'},'rows':{'14':'....KPPPPPPPPPPPPPPK....','15':'....KPPPPPPPPPPPPPPK....','16':'.....KDPPPPPPPPPPDK.....','17':'.............KPPPK......','18':'.............KPDPK......','19':'.............KPPPK......','20':'.............KKKKK......'}},
  'accessory:headphones': {'palette':{'K':'#3a2622','V':'#8b5cf6','D':'#6d3fd4'},'rows':{'0':'.....KVVVVVVVVVVVVK.....','1':'....KVVK........KVVK....','2':'....KVK..........KVK....','7':'.KKK................KKK.','8':'.KVVK..............KVVK.','9':'.KVDK..............KDVK.','10':'.KVVK..............KVVK.','11':'.KKK................KKK.'}},
  'accessory:sunglasses': {'palette':{'K':'#3a2622','B':'#1a1a1a','C':'#7ec8f0'},'rows':{'8':'.....KBBBBKKKKBBBBK.....','9':'.....KBCBBK..KBCBBK.....','10':'......KBBK....KBBK......'}},
  'accessory:bowtie': {'palette':{'K':'#3a2622','R':'#d8434e','M':'#a02832'},'rows':{'15':'.......KRRK..KRRK.......','16':'.......KRRRMMRRRK.......','17':'.......KRRK..KRRK.......'}},
  'accessory:mask': {'palette':{'K':'#3a2622','T':'#7fd8c4','D':'#57b8a2'},'rows':{'10':'....KKKTTTTTTTTTTKKK....','11':'......KTTTTTTTTTTK......','12':'......KTDDDDDDDDTK......','13':'.......KTTTTTTTTK.......'}},
  'accessory:necklace': {'palette':{'G':'#e8b64c','P':'#ff9db0'},'rows':{'16':'......G..........G......','17':'.......GG......GG.......','18':'.........GGPPGG.........'}},
}
