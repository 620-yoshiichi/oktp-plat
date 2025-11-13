import {NewCarEasySearchBuilder} from 'src/non-common/EsCollection/newCarEasySearchBuilder'
import {QrbpEasySearchBuilder} from 'src/non-common/EsCollection/QRBP_EasySearchBuilder'
import {shinrenEasySearchBuilder} from 'src/non-common/EsCollection/shinrenEasySearchBuilder'
import {ucarEasySearchBuilder} from 'src/non-common/EsCollection/ucarEasySearchBuilder'

export const EasySearchBuilderCollection = {
  newCar: NewCarEasySearchBuilder,
  ucar: ucarEasySearchBuilder,
  QRBP: QrbpEasySearchBuilder,
  shinren: shinrenEasySearchBuilder,
}
