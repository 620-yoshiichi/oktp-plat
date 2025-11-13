import {isDev} from '@cm/lib/methods/common'

const autoPrintFolderId = `https://drive.google.com/drive/folders/1_lsgPdIu9O4IOybMOTSgQyt8dj6ehRCe`

const isTest = isDev

export const UCAR_GOOGLE_CONSTANTS = {
  hikitoriNotice: {
    SS_URL: `https://docs.google.com/spreadsheets/d/1YvBtUYwK2m-q-sxCKzOIFaFgfeNo60S4Q1dSQED8SHo/edit?gid=479628304#gid=479628304`,
    SH_NAME: `引取依頼`,
    parentFolderIds: [
      //

      isTest ? `https://drive.google.com/drive/folders/1kHdILfFNMck6fLl1ok9jj8ecGiTTK38F?ths=true` : autoPrintFolderId,
    ],
  },
  cancelNotice: {
    SS_URL: `https://docs.google.com/spreadsheets/d/1A6XK-EaTUu6vSzz6lOD_F5toyq6jEUIDSjOd9zrNZ-k/edit?gid=479628304#gid=479628304`,
    SH_NAME: `キャンセル用紙`,
    parentFolderIds: [
      //
      isTest ? `https://drive.google.com/drive/folders/1bOapQhJ_VObnYZFleQ42CYbbdqEV1g9h?ths=true` : autoPrintFolderId,
    ],
  },
}
