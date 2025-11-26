
export const prismaSchemaString = `
model Car {
  id                        Int               @id @default(autoincrement())
  createdAt                 DateTime          @default(now())
  updatedAt                 DateTime?         @updatedAt
  processLastUpdatedAt      DateTime?
  active                    Boolean           @default(true)
  sortOrder                 Float             @default(0)
  bpNumber                  String
  orderedAt                 DateTime?
  orderCategory             Int?
  estimate                  Int?
  orderStatusCategory       Int?
  customerName              String?
  carName                   String?
  plate                     String?
  frame                     String?
  katashiki                 String?
  managementCode            String?
  initDate                  Int?
  currentEstimate           Int?
  scheduledAt               DateTime?
  insuranceType             String?
  insuranceCompany          String?
  agreedPrice               Int?
  userId                    Int?
  crUserId                  Int?
  storeId                   Int?
  damageNameMasterId        Int?
  orderNumber               String?
  crScheduledAt             DateTime?
  representativeCarBpNumber String?
  favoredByUserIds          Int[]
  prePermission             Boolean?
  preStart                  Boolean?
  carType                   String?           @default("BP")
  advancePayment            Int?
  complexKey                String?           @unique
  DamageNameMaster          DamageNameMaster? @relation(fields: [damageNameMasterId], references: [id], onDelete: Cascade)
  Store                     Store?            @relation(fields: [storeId], references: [id], onDelete: Cascade)
  User                      User?             @relation(fields: [userId], references: [id], onDelete: Cascade)
  CrUser                    CrUser?
  Notes                     Notes[]
  Process                   Process[]
  Slot                      Slot[]

  @@index([userId])
  @@index([storeId])
  @@index([scheduledAt])
  @@index([crScheduledAt])
  @@index([damageNameMasterId])
}

model UserProcessConfirmation {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  sortOrder Float     @default(0)
  userId    Int
  date      DateTime
  checked   Boolean   @default(false)
  updatedAt DateTime? @updatedAt
  User      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date], name: "unique_userId_date")
}

model Notes {
  id               Int            @id @default(autoincrement())
  createdAt        DateTime       @default(now())
  active           Boolean        @default(true)
  sortOrder        Float          @default(0)
  content          String
  settled          Boolean?       @default(false)
  carId            Int?
  noteNameMasterId Int
  userId           Int?
  updatedAt        DateTime?      @updatedAt
  Car              Car?           @relation(fields: [carId], references: [id], onDelete: Cascade)
  NoteNameMaster   NoteNameMaster @relation(fields: [noteNameMasterId], references: [id], onDelete: Cascade)
  User             User?          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([noteNameMasterId, carId])
  @@index([carId])
  @@index([userId])
}

model DamageNameMaster {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  name      String    @unique
  type      String?
  color     String?
  carPerDay Float     @default(3)
  updatedAt DateTime? @updatedAt
  Car       Car[]
  User      User[]
}

model NoteNameMaster {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  name      String    @unique
  type      String?
  color     String?
  updatedAt DateTime? @updatedAt
  Notes     Notes[]
}

model BpSummary {
  id        Int       @id @default(autoincrement())
  code      Int?      @unique
  createdAt DateTime  @default(now())
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  date      DateTime
  key       String
  label     String
  count     Int
  storeId   Int?
  updatedAt DateTime? @updatedAt
  Store     Store?    @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([date, key, storeId], name: "unique_date_key_storeId")
  @@index([date, storeId])
  @@index([storeId])
}

model ProcessNameMaster {
  id               Int       @id @default(autoincrement())
  createdAt        DateTime  @default(now())
  active           Boolean   @default(true)
  sortOrder        Float     @default(0)
  name             String    @unique
  type             String?
  color            String?
  onEnginerProcess Boolean?  @default(false)
  repetitionLimit  Int?
  updatedAt        DateTime? @updatedAt
  Process          Process[]

  @@index([name])
}

model Process {
  id                  Int                @id @default(autoincrement())
  createdAt           DateTime           @default(now())
  updatedAt           DateTime?          @updatedAt
  date                DateTime?          @default(now())
  active              Boolean            @default(true)
  sortOrder           Float              @default(0)
  time                Float?
  processNameMasterId Int?
  carId               Int?
  userId              Int?
  storeId             Int?
  note                String?
  name                String?
  type                String?            @default("")
  Car                 Car?               @relation(fields: [carId], references: [id], onDelete: Cascade)
  ProcessNameMaster   ProcessNameMaster? @relation(fields: [processNameMasterId], references: [id], onDelete: Cascade)
  Store               Store?             @relation(fields: [storeId], references: [id], onDelete: Cascade)
  User                User?              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([processNameMasterId, carId])
  @@index([date])
  @@index([carId])
  @@index([storeId])
  @@index([userId])
}

model ReleaseNotes {
  id               Int       @id @default(autoincrement())
  createdAt        DateTime  @default(now())
  sortOrder        Float     @default(0)
  rootPath         String
  title            String?
  msg              String
  imgUrl           String?
  confirmedUserIds Int[]
  updatedAt        DateTime? @updatedAt
}

model CrUser {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime?
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  carId     Int       @unique
  userId    Int
  Car       Car       @relation(fields: [carId], references: [id], onDelete: Cascade)
  User      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([carId, userId], name: "unique_carId_userId")
  @@index([userId])
}

model JuchuShitadoriDb {
  id        Int     @unique @default(autoincrement())
  sortOrder Float   @default(0)
  APPINDEX  String  @id
  NewCar    NewCar? @relation(fields: [APPINDEX_FKEY], references: [APPINDEX])
  UPASS     UPASS?  @relation(fields: [NO_SATEISYO], references: [sateiID])

  APPINDEX_FKEY String?
  CD_KAISYA     String?
  KB_SINCYU     String?
  NO_CYUMON     String?
  NO_CYUMONED   String?
  NO_SITARENB   String?
  KB_SITASNSY   String?
  CD_NORIKUSI   String?
  KB_NOSYASYU   String?
  CD_NOGYOTAI   String?
  NO_NOSEIRI    String?
  KB_RIKUSI     String?
  KB_MITRCHUB   String?
  NO_SATEISYO   String?
  NO_SITERUIB   String?
  DD_SATEI      String?
  NO_SYARYOU    String?
  KI_SITADKAK   String?
  NU_JIBAIMIK   String?
  NU_ZEIRITU    String?
  KB_SITASYHI   String?
  KI_SITASYHI   String?
  KI_SITATHU1   String?
  KI_SITATHU2   String?
  KI_SITATHU3   String?
  CD_SITADOSY   String?
  DD_SYKNMANR   String?
  SU_SYNDOTOR   String?
  MJ_SITKATA    String?
  MJ_FURUKATA   String?
  MJ_FURON      String?
  NO_SYADAIBA   String?
  NU_SOUKOUKM   String?
  KJ_SIYOSYA    String?
  KJ_SYYUMAI    String?
  KB_ZANSEKSA   String?
  MJ_ZANSEKSA   String?
  DD_KANSAIYO   String?
  DD_KAIKESAI   String?
  KI_SITAKESA   String?
  KJ_SITAMEMO   String?
  KB_JIDZMNOH   String?
  KB_YOTAKU     String?
  KI_AZRECYYO   String?
  KI_SYRDST     String?
  KI_AIRBAGRU   String?
  KI_FURONR     String?
  KI_JOHOKR     String?
  KI_SIKNKNR    String?
  NO_RECYCLEK   String?
  KB_SIYZJDHT   String?
  KJ_SAISSYYU   String?
  KI_SIYZJDHI   String?
  KI_STJIZESO   String?
  MJ_SIYZSHIF   String?
  MJ_HIKIZUMF   String?
  DD_SITATORI   String?
  NO_SITAJOJO   String?
  NO_KYUSATEI   String?
  DT_SAISINUP   String?
  MJ_SASINTAN   String?
  N_JUCYU       String?
  U_JUCYU       String?
  KJ_SYAMEI     String?

  @@index([APPINDEX_FKEY])
  @@index([NO_SATEISYO])
}

model OldCars_Base {
  id          Int     @unique @default(autoincrement())
  sortOrder   Float   @default(0)
  APPINDEX    String  @id @unique
  CD_21SYAMEI String?
  MJ_SYAMEI   String?
  CD_HANSTAFF String?
  CD_HANTENPO String?
  NO_SIRETYUM String?
  MJ_SIRENORI String?
  KB_SIRETOSY String?
  CD_SIRETOGY String?
  NO_SIRETOSE String?
  NO_HANJTRIK String?
  KB_HANTOSY  String?
  CD_HANTOGY  String?
  NO_HANTOSE  String?
  CD_SITASTAF String?
  DD_SIIRE    String?
  DD_SIREBD   String?
  SU_SYODOTOR String?
  NO_FRAME    String?
  KI_SIIREKA  String?
  KI_HANKAKA  String?
  KB_SIIRE    String?
  KB_SIHARAI  String?
  KB_URIAGE   String?
  NO_CYUMON   String?
  NO_CYUMONED String?
  NO_SYARYOU  String?
  NO_SYADAIBA String?
  DT_SAISINUP String?
  MJ_KATASIKI String?
  NU_SOUKOUKM String?
  CD_SIRETENP String?
  KJ_SIRESAKI String?
  KB_UC1JTORO String?
  DD_URIAGE   String?
  DD_1JTOROKU String?
  DD_2JTOROKU String?
  DD_SYKNMANR String?
  DD_SITASYUK String?
  DD_NOSYA    String?
  MJ_SITADOTE String?

  Number98   Number98?    @relation(fields: [NO_SYARYOU], references: [number])
  Ucar       Ucar[]
  ZAIKO_Base ZAIKO_Base[]

  @@unique([NO_SIRETYUM, NO_SYARYOU, DD_SIIRE])
  @@index([NO_SYARYOU])
}

model ZAIKO_Base {
  id            Int     @unique @default(autoincrement())
  sortOrder     Float   @default(0)
  APPINDEX      String  @id @unique
  APPINDEX_FKEY String
  NO_SYARYOU    String?
  KB_SIIRE      String?
  DD_KEIRIKEI   String?
  NO_SIRETYUM   String?
  MJ_SIRENORI   String?
  KB_SIRETOSY   String?
  CD_SIRETOGY   String?
  NO_SIRETOSE   String?
  MJ_SIRESAKI   String?
  CD_SITADOTE   String?
  CD_SITASTAF   String?
  CD_SIRETENP   String?
  MJ_FURUSYAM   String?
  NO_KATASIKI   String?
  NO_FRAME      String?
  CD_TENJTENP   String?
  KI_HNBSIJIK   String?
  KI_TENTOHYJ   String?
  CD_ZAIKSYYS   String?
  KB_SYASYHAN   String?
  NO_SYADAIBA   String?
  KI_SIIREKA    String?
  KN_KEI        String?
  MJ_ZAIKOST    String?
  CD_ZAIKOTEN   String?
  NO_CYUMON     String?
  KB_URIAGE     String?
  CD_HANSTAFF   String?
  MJ_21SYASYS   String?
  MJ_SIJYOKBM   String?
  DT_SAISINUP   String?
  DD_SIIRE      String?

  OldCars_Base OldCars_Base? @relation(fields: [NO_SIRETYUM, NO_SYARYOU, DD_SIIRE], references: [NO_SIRETYUM, NO_SYARYOU, DD_SIIRE])

  @@unique([NO_SIRETYUM, NO_SYARYOU, DD_KEIRIKEI])
  @@index([NO_SYARYOU])
  @@index([CD_ZAIKOTEN])
  @@index([NO_SIRETYUM, NO_SYARYOU, DD_SIIRE])
}

model UpassFamilyTree {
  id          Int       @unique @default(autoincrement())
  sateiID     String    @unique
  rootSateiID String
  sateiDate   DateTime?

  UPASS UPASS @relation(name: "MyUpassTree", fields: [sateiID], references: [sateiID])

  RootUpass UPASS @relation(name: "RootUpass", fields: [rootSateiID], references: [sateiID])

  @@unique([sateiID, rootSateiID])
}

model UPASS {
  MyUpassTree UpassFamilyTree? @relation(name: "MyUpassTree")

  RootUpass UpassFamilyTree[] @relation("RootUpass")

  id                                  Int                @unique @default(autoincrement())
  dataSource                          String
  JuchuShitadoriDb                    JuchuShitadoriDb[]
  sortOrder                           Float              @default(0)
  sateiID                             String             @unique
  dealerName                          String?
  dealerCode                          String?
  assessmentMode                      String?
  assessmentMode2                     String?
  status                              String?
  valuationType                       String?
  valuationNumber                     String?
  palAssessmentNumber                 String?
  landAffairsName                     String?
  registrationClassNumber             String?
  registrationKana                    String?
  registrationSerialNumber            String?
  registrationDate                    DateTime?
  firstRegistrationDate               String?
  modelYear                           String?
  modelYearType                       String?
  chassisNumber                       String?
  frameNumber                         String?
  brandName                           String?
  modelName                           String?
  ai21ModelCode                       String?
  grade                               String?
  type                                String?
  commonType                          String?
  engineType                          String?
  vehicleHistory                      String?
  capacityMin                         String?
  capacityMax                         String?
  maxLoad                             String?
  weight                              String?
  grossWeight                         String?
  length                              String?
  width                               String?
  height                              String?
  displacement                        String?
  fuelName                            String?
  typeDesignationNumber               String?
  categoryNumber                      String?
  ownerName                           String?
  userName                            String?
  useOwnershipSameFlag                String?
  ai21CustomerCode                    String?
  customerName                        String?
  customerKanaSurname                 String?
  customerKanaName                    String?
  inspectionExpiryDate                DateTime?
  odometerDisplayValue                String?
  newCarWarranty                      String?
  maintenanceManual                   String?
  instructionManual                   String?
  periodicInspectionRecord            String?
  unexpiredLiabilityAmount            String?
  liabilityInsuranceStartDate         DateTime?
  liabilityInsuranceEndDate           DateTime?
  unexpiredTaxAmount                  String?
  recyclingCertificate                String?
  recyclingCertificateNumber          String?
  shredderDustFee                     String?
  airbagFee                           String?
  freonFee                            String?
  infoManagementFee                   String?
  recyclingDeposit                    String?
  importCategory                      String?
  bodyType                            String?
  driveType                           String?
  transmissionType                    String?
  steering                            String?
  doorType                            String?
  coldWeatherSpec                     String?
  exteriorColor                       String?
  colorCode                           String?
  colorName                           String?
  interiorColor                       String?
  repairHistory                       String?
  mileageKm                           String?
  meterReplacement                    String?
  totalMileage                        String?
  importVehicle                       String?
  modelYearDetail                     String?
  sunroofMoonroof                     String?
  frontAc                             String?
  rearAc                              String?
  powerSteering                       String?
  powerWindow                         String?
  abs                                 String?
  electricSlideDoor                   String?
  seatMaterial                        String?
  airbagFeeDetail                     String?
  carNaviDa                           String?
  tv                                  String?
  rearMonitor                         String?
  backMonitor                         String?
  cd                                  String?
  dvd                                 String?
  mediaPlayer                         String?
  rearEntertainment                   String?
  markLevinson                        String?
  aeroSpoiler                         String?
  aluminumWheel                       String?
  cruiseControl                       String?
  skidControl                         String?
  immobilizer                         String?
  powerSeat                           String?
  fullFlat                            String?
  benchSeat                           String?
  threeRowSeat                        String?
  walkThrough                         String?
  lowDown                             String?
  headlamp                            String?
  keylessEntry                        String?
  remoteStarter                       String?
  etc                                 String?
  oneOwner                            String?
  testDrive                           String?
  activeStabilizer                    String?
  collisionAvoidance                  String?
  pedalMisstep                        String?
  laneDeparture                       String?
  advancedLight                       String?
  blindSpotMonitor                    String?
  panoramicViewMonitor                String?
  driveRecorder                       String?
  idling                              String?
  outlet                              String?
  additionalEquipment1                String?
  additionalEquipment2                String?
  additionalEquipment3                String?
  additionalEquipment4                String?
  additionalEquipment5                String?
  evFlag                              String?
  reFlag                              String?
  ac                                  String?
  navi                                String?
  tv2                                 String?
  leather                             String?
  sr                                  String?
  aluminum                            String?
  assessmentdatetime                  DateTime?
  tradeInPurchaseCategory             String?
  pickupScheduledDate                 DateTime?
  requestingName                      String?
  requestingCode                      String?
  assessmentname                      String?
  assessmentcode                      String?
  assessmentStaffName                 String?
  assessmentStaffCode                 String?
  salesname                           String?
  salescode                           String?
  salesStaffName                      String?
  salesStaffCode                      String?
  plannedPurchaseVehicle              String?
  residualValueInstallmentFinalDate   DateTime?
  residualValueInstallmentFinalAmount String?
  urgencyStatus                       String?
  valuationContactNotes               String?
  valuationRequestDatetime            DateTime?
  comprehensiveEvaluationScore        String?
  assessmentAdjustmentPointsTotal     String?
  newCarPriceExcludingTax             String?
  assessmentPrice                     String?
  adjustmentAmountTotal               String?
  adjustmentAmount1                   String?
  adjustmentAmount1Notes              String?
  adjustmentAmount2                   String?
  adjustmentAmount2Notes              String?
  adjustmentAmount3                   String?
  adjustmentAmount3Notes              String?
  adjustmentAmount4                   String?
  adjustmentAmount5                   String?
  approvedPrice                       String?
  assessmentResponsePrice             String?
  inventoryAssessmentResponsePrice    String?
  assessmentError                     String?
  valuationNotesMemo                  String?
  salesPriceMemo                      String?
  salesStaffContactNotes              String?
  valuationName                       String?
  valuationcode                       String?
  valuationStoreName                  String?
  valuationEmployeeCode               String?
  inspectionname                      String?
  inspectioncode                      String?
  pricingStoreName                    String?
  pricecode                           String?
  inspectioName                       String?
  inspectionNameCode                  String?
  pricingPersonName                   String?
  pricingPersonCode                   String?
  valuationResponsedatetime           DateTime?
  valuationStarttime                  DateTime?
  valuationEndtime                    DateTime?
  valuationRequiredtime               String?
  priceConfirmationdatetime           String?
  inventoryAssessmentConfirmationdate String?
  previousValuationnumber             String?
  previousAssessmentnumber            String?
  cpoCategory                         String?
  Ucar                                Ucar?
}

model QR_Prosess {
  id               Int       @unique @default(autoincrement())
  sortOrder        Float     @default(0)
  sateiId          String    @unique
  Sorting_results  String?
  datetime_0       DateTime?
  email_0          String?
  store_0          String?
  runnable_0       String?
  remarks_0        String?
  shitadoriKubun_0 String?
  orderNumber_0    String?
  datetime_1       DateTime?
  datetime_2       DateTime?
  datetime_3       DateTime?
  datetime_4       DateTime?
  datetime_6       DateTime?
  datetime_7       DateTime?
  datetime_8       DateTime?
  datetime_9       DateTime?
  datetime_11      DateTime?
  datetime_12      DateTime?
  datetime_13      DateTime?
  datetime_14      DateTime?
  max_update       DateTime?

  Ucar Ucar? @relation(fields: [sateiId], references: [sateiID], map: "QR_Prosess_Ucar_sateiId_fkey")

  @@index([sateiId])
}

model DeliverSchedule {
  id             Int              @id @default(autoincrement())
  createdAt      DateTime         @default(now())
  sortOrder      Float            @default(0)
  date           DateTime?        @unique
  carIds         Int[]
  updatedAt      DateTime?        @updatedAt
  LoadingVehicle LoadingVehicle[]
}

model Area {
  id             Int              @id @default(autoincrement())
  createdAt      DateTime         @default(now())
  sortOrder      Float            @default(0)
  name           String           @unique
  color          String?
  updatedAt      DateTime?        @updatedAt
  LoadingVehicle LoadingVehicle[]
  Store          Store[]
}

model LoadingVehicle {
  id                Int              @id @default(autoincrement())
  createdAt         DateTime         @default(now())
  sortOrder         Float            @default(0)
  deliverScheduleId Int?
  areaId            Int?
  pickedCarIds      String[]
  slot              Int?
  updatedAt         DateTime?        @updatedAt
  Area              Area?            @relation(fields: [areaId], references: [id], onDelete: Cascade)
  DeliverSchedule   DeliverSchedule? @relation(fields: [deliverScheduleId], references: [id], onDelete: Cascade)
  Slot              Slot[]

  @@index([areaId])
  @@index([deliverScheduleId])
}

model Slot {
  id               Int            @id @default(autoincrement())
  createdAt        DateTime       @default(now())
  sortOrder        Float          @default(0)
  carId            Int?
  newCarId         Int?
  loadingVehicleId Int
  updatedAt        DateTime?      @updatedAt
  Car              Car?           @relation(fields: [carId], references: [id], onDelete: Cascade)
  LoadingVehicle   LoadingVehicle @relation(fields: [loadingVehicleId], references: [id], onDelete: Cascade)
  NewCar           NewCar?        @relation(fields: [newCarId], references: [id], onDelete: Cascade)

  @@index([loadingVehicleId])
  @@index([carId])
  @@index([newCarId])
}

model NewCar {
  id                            Int       @id @default(autoincrement())
  createdAt                     DateTime  @default(now())
  sortOrder                     Float     @default(0)
  storeId                       Int
  updatedAt                     DateTime? @updatedAt
  APPINDEX                      String    @unique
  CD_HANSTAFF                   String?
  CD_NCSYAMEI                   String?
  CD_TENPO                      String?
  DD_CENTTYAB                   DateTime?
  DD_CENTYOB                    DateTime?
  DD_FR                         DateTime?
  DD_HAISKIBO                   DateTime?
  DD_HAISOU                     DateTime?
  DD_HAISOYOT                   DateTime?
  DD_HONBSYOK                   DateTime?
  DD_JUCYU                      DateTime?
  DD_JUCYUKE                    DateTime?
  DD_KIBONOKI                   DateTime?
  DD_MAKERSYU                   DateTime?
  DD_NOSYA                      DateTime?
  DD_SYOUNIN1                   DateTime?
  DD_SYOUNIN2                   DateTime?
  DD_SYOUNIN3                   DateTime?
  DD_TENPSYOK                   DateTime?
  DD_TOROKIBO                   DateTime?
  DD_TOTYAKUY                   DateTime?
  DD_TOUROKU                    DateTime?
  DD_URIKZUMI                   DateTime?
  KJ_KAINMEI1                   String?
  KJ_KURUMAME                   String?
  KJ_MEIGIME1                   String?
  MJ_HANTENKT                   String?
  NO_CYUMON                     String?
  NO_FRAME                      String?
  m0Status                      String?
  m0_deadline_nousya            DateTime?
  m0_remarks                    String?
  m1Status                      String?
  m1_deadline_money             DateTime?
  m1_deadline_paper             DateTime?
  m1_remarks                    String?
  m2Status                      String?
  m2_date                       DateTime?
  m2_remarks                    String?
  userId                        Int
  m1Alert                       DateTime?
  m2Alert                       DateTime?
  lastApprovedDesiredTorokuDate DateTime?
  m2_check1                     Boolean?
  m2_check2                     Boolean?
  m1_toroku_prediction          DateTime?
  initial_m0_deadline_nousya    DateTime?
  initial_m1_deadline_money     DateTime?
  initial_m1_deadline_paper     DateTime?
  initial_m1_toroku_prediction  DateTime?

  DD_KARINOKI                     DateTime?
  DD_SAGTYYO                      DateTime?
  KB_OSSSIN                       String?
  MJ_OSSTSNST                     String?
  KI_BETSIHAK                     Int?      @default(0)
  KI_MAEUNYUK                     Int?      @default(0)
  KI_NYURUIKE                     Int?      @default(0)
  KI_SHRIGK                       Int?      @default(0)
  KI_SITANYKG                     Int?      @default(0)
  crOperationRemarks              String?
  haisou_tooEarly                 Boolean?
  torokuApplicationRequired       Boolean?
  DD_CENTSYUB                     DateTime?
  DD_GENSYNYK                     DateTime?
  KI_SITADORI                     Int?
  KI_SITZAN                       Int?
  DD_TORIKESI                     DateTime?
  DD_MAX_UPDATE                   DateTime?
  earliestHaisouDate              DateTime?
  DD_LATEST_HAISOU                DateTime?
  DD_HAISYYO                      DateTime?
  DD_KANSEI                       DateTime?
  DD_KRHURI                       DateTime?
  KB_DAIHYNAI                     String?
  TM_TOTUTMKE                     Int?
  CUSTOM_DD_SEISANYOTEI           DateTime?
  CUSTOM_FR_DATE                  String?
  CUSTOM_FR_KARI_NOTATION         String?
  CUSTOM_FR_NOTATION_TYPE         String?
  CUSTOM_FR_PREFIX                String?
  CUSTOM_FR_SUFFIX                String?
  CUSTOM_KB_GYOCYOK               String?
  CUSTOM_KB_SEIBETU               String?
  CUSTOM_SEISANYOTEI              String?
  CUSTOM_ZAIKO_KB_NOTATION        String?
  CUSTOM_paymentCheck             Boolean?
  CUSTOM_paymentCheckCustomerType String?
  CUSTOM_NET_SHITADORI_PRICE      Int?
  KB_ZAIKOJYO                     String?
  isDaikoNosya                    Boolean   @default(false)
  sateiNyukobiAlert               Boolean   @default(false)
  shitadoriAlertCount             Int?

  ossSpreadsheetUrl String?

  transferType String @default("可能")

  CrInspectionHistory      CrInspectionHistory[]
  DesiredTorokuDate        DesiredTorokuDate[]
  OrderSwitchingHisotory   OrderSwitchingHisotory? @relation(fields: [orderSwitchingHisotoryId], references: [id])
  orderSwitchingHisotoryId Int?                    @unique
  Store                    Store                   @relation(fields: [storeId], references: [id], onDelete: Cascade)
  User                     User                    @relation(fields: [userId], references: [id])
  NewCarLeadTime           NewCarLeadTime[]
  Slot                     Slot[]

  Ucar                       Ucar[]
  SeisanYoteiHistory         SeisanYoteiHistory[]
  FuriateStatusOnApprovement FuriateStatusOnApprovement?
  CarTransferHistory         CarTransferHistory[]

  TenpoTsuikoShinseiHeader TenpoTsuikoShinseiHeader[]
  TenpoTsuikoData          TenpoTsuikoData[]

  JuchuShitadoriDb JuchuShitadoriDb[]

  @@index([userId])
  @@index([storeId])
}

model OrderSwitchingHisotory {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)
  userId    Int
  NewCar    NewCar?
  User      User      @relation(fields: [userId], references: [id])

  @@index([userId])
}

model DesiredTorokuDate {
  id         Int       @id @default(autoincrement())
  createdAt  DateTime  @default(now())
  updatedAt  DateTime? @updatedAt
  sortOrder  Float     @default(0)
  date       DateTime
  remarks    String?
  newCarId   Int
  status     String?
  torokuType String?
  NewCar     NewCar    @relation(fields: [newCarId], references: [id], onDelete: Cascade)

  @@index([newCarId])
}

model NewCarLeadTime {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)
  key       String
  value     Float?
  newCarId  Int
  NewCar    NewCar    @relation(fields: [newCarId], references: [id])

  @@unique([newCarId, key], name: "newCarId_key_unique")
}

model CrInspectionHistory {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)
  newCarId  Int
  userId    Int
  status    String?
  date      DateTime?
  NewCar    NewCar    @relation(fields: [newCarId], references: [id])
  User      User      @relation(fields: [userId], references: [id])

  @@index([newCarId])
  @@index([userId])
}

model SeisanYoteiHistory {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  key      String @unique
  NewCar   NewCar @relation(fields: [newCarId], references: [id])
  newCarId Int

  from       String
  to         String
  fromDate   DateTime?
  toDate     DateTime?
  issuedAt   DateTime
  notifyedAt DateTime?

  @@index([newCarId, key], name: "newCarId_key_unique")
}

model UserProgressAggregationTable {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  date    DateTime
  timing  String
  label   String
  count   Int
  storeId Int?
  Store   Store?   @relation(fields: [storeId], references: [id])
  userId  Int
  User    User     @relation(fields: [userId], references: [id])

  @@unique([date, userId, timing, label], name: "date_userId_timing_label_unique")
  @@index([storeId])
  @@index([userId])
}

model ProgressAggregationTable {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  date    DateTime
  storeId Int
  Store   Store    @relation(fields: [storeId], references: [id])

  ProgressAggregationTableRecord ProgressAggregationTableRecord[]

  @@unique([date, storeId], name: "date_storeId_unique")
  @@index([storeId])
}

model ProgressAggregationTableRecord {
  id                         Int                      @id @default(autoincrement())
  createdAt                  DateTime                 @default(now())
  updatedAt                  DateTime?                @updatedAt
  sortOrder                  Float                    @default(0)
  timing                     String
  label                      String
  count                      Int
  ProgressAggregationTable   ProgressAggregationTable @relation(fields: [progressAggregationTableId], references: [id])
  progressAggregationTableId Int

  @@unique([progressAggregationTableId, timing, label], name: "progressAggregationTableId_timing_label_unique")
}

model FuriateStatusOnApprovement {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  newCarId Int    @unique
  NewCar   NewCar @relation(fields: [newCarId], references: [id])

  DD_FR DateTime?
}

model CarTransferHistory {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  location                 String?
  transferredAt            DateTime?
  transferConfirmedOnAi21  Boolean?
  recoveredAt              DateTime?
  recoveredConfirmedOnAi21 Boolean?
  remarks                  String?

  NewCar   NewCar @relation(fields: [newCarId], references: [id])
  newCarId Int

  @@index([newCarId])
}

// 振り当て済み
// 配送希望なし
// 登録されていないもの

model TenpoTsuikoShinseiHeader {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  date          DateTime
  newCarId      Int
  approvalOrder Int      @default(1)
  active        Boolean  @default(true)

  NewCar                   NewCar                     @relation(fields: [newCarId], references: [id], onDelete: Cascade)
  TenpoTsuikoShinseiDetail TenpoTsuikoShinseiDetail[]

  @@index([newCarId])
}

model TenpoTsuikoShinseiDetail {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  userId                     Int
  status                     String    @default("waiting") // waiting, pending, approved, rejected
  comment                    String?
  approvalOrder              Int
  tenpoTsuikoShinseiHeaderId Int
  processedAt                DateTime?

  User                     User                     @relation(fields: [userId], references: [id])
  TenpoTsuikoShinseiHeader TenpoTsuikoShinseiHeader @relation(fields: [tenpoTsuikoShinseiHeaderId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tenpoTsuikoShinseiHeaderId])
}

model TenpoTsuikoData {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  // BigQueryから取得したデータ
  APPINDEX      String  @unique
  APPINDEX_FKEY String?
  CD_TUIKO      String
  MJ_TUIKOM     String?
  KI_TUIKOKIN   Int?
  CD_TENPO      String?
  CD_HANSTAFF   String?
  KJ_KURUMAME   String?
  NO_CYUMON     String?
  KJ_KAINMEI1   String?

  // NewCarとの関連
  // newCarId Int?
  NewCar NewCar? @relation(fields: [APPINDEX_FKEY], references: [APPINDEX], onDelete: Cascade)

  // 処理済みフラグ
  processed   Boolean   @default(false)
  processedAt DateTime?

  @@index([APPINDEX_FKEY])
  @@index([CD_TUIKO])
  @@index([processed])
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["prismaSchemaFolder"]
}

datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  directUrl    = env("DIRECT_URL")
  relationMode = "prisma"
}

model Store {
  id        Int       @id @default(autoincrement())
  code      Int       @unique
  createdAt DateTime  @default(now())
  active    Boolean   @default(true)
  sortOrder Float     @default(0)
  name      String    @unique
  areaId    Int?
  updatedAt DateTime? @updatedAt

  tel     String?
  fax     String?
  address String?

  BpSummary BpSummary[]
  Car       Car[]
  NewCar    NewCar[]
  Process   Process[]
  Area      Area?       @relation(fields: [areaId], references: [id], onDelete: Cascade)
  Ucar      Ucar[]

  User                         User[]
  ProgressAggregationTable     ProgressAggregationTable[]
  UserProgressAggregationTable UserProgressAggregationTable[]

  DestinatedUcar Ucar[] @relation("DestinationStore")

  TmpRentalUcar Ucar[] @relation("TmpRentalStore")

  @@index([areaId])
}

model User {
  id                   Int       @id @default(autoincrement())
  code                 Int?      @unique
  createdAt            DateTime  @default(now())
  active               Boolean   @default(true)
  sortOrder            Float     @default(0)
  name                 String    @default("")
  kana                 String?   @default("")
  email                String?   @unique
  password             String?
  type                 String?
  role                 String    @default("ユーザー")
  tempResetCode        String?
  tempResetCodeExpired DateTime?
  storeId              Int?
  schoolId             Int?
  rentaStoreId         Int?
  type2                String?
  shopId               Int?
  membershipName       String?
  damageNameMasterId   Int?
  color                String?
  tell                 String?
  app                  String?
  updatedAt            DateTime? @updatedAt
  apps                 String[]
  loginCheck           DateTime?

  Car                          Car[]
  CrInspectionHistory          CrInspectionHistory[]
  CrUser                       CrUser[]
  NewCar                       NewCar[]
  Notes                        Notes[]
  OrderSwitchingHisotory       OrderSwitchingHisotory[]
  Outcome                      Outcome[]
  OutcomeMaster                OutcomeMaster[]
  Process                      Process[]
  Purpose                      Purpose[]
  PurposeMaster                PurposeMaster[]
  RentaCustomer                RentaCustomer[]
  RentaDailyReport             RentaDailyReport[]
  RentaDeal                    RentaDeal[]
  Ucar                         Ucar[]
  UcarPaperWorkNotes           UcarPaperWorkNotes[]
  UcarProcess                  UcarProcess[]
  DamageNameMaster             DamageNameMaster?              @relation(fields: [damageNameMasterId], references: [id], onDelete: Cascade)
  RentaStore                   RentaStore?                    @relation(fields: [rentaStoreId], references: [id], onDelete: Cascade)
  Store                        Store?                         @relation(fields: [storeId], references: [id], onDelete: Cascade)
  UserProcessConfirmation      UserProcessConfirmation[]
  UserRole                     UserRole[]
  UserProgressAggregationTable UserProgressAggregationTable[]
  TenpoTsuikoShinseiDetail     TenpoTsuikoShinseiDetail[]

  @@index([rentaStoreId])
  @@index([damageNameMasterId])
  @@index([storeId])
}

model GoogleAccessToken {
  id          Int       @id @default(autoincrement())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime? @default(now()) @updatedAt
  sortOrder   Float     @default(0)
  email       String    @unique
  tokenJSON   String?
  expiry_date DateTime?
}

model RoleMaster {
  id          Int        @id @default(autoincrement())
  createdAt   DateTime   @default(now())
  updatedAt   DateTime?  @updatedAt
  sortOrder   Float      @default(0)
  name        String     @unique
  description String?
  color       String?
  apps        String[]
  UserRole    UserRole[]
}

model UserRole {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  userId       Int
  roleMasterId Int

  RoleMaster RoleMaster @relation(fields: [roleMasterId], references: [id], onDelete: Cascade)
  User       User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, roleMasterId], name: "userId_roleMasterId_unique")
  @@index([roleMasterId])
}

model Calendar {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)
  date      DateTime  @unique
  cr        Boolean   @default(false)
  sharyobu  Boolean   @default(false)
}

model ChainMethodLock {
  id        Int       @id @default(autoincrement())
  isLocked  Boolean   @default(false)
  expiresAt DateTime?
  updatedAt DateTime  @updatedAt
}

model RentaStore {
  id               Int                @id @default(autoincrement())
  createdAt        DateTime           @default(now())
  active           Boolean            @default(true)
  sortOrder        Float              @default(0)
  name             String             @unique
  code             Int?               @unique
  updatedAt        DateTime?          @updatedAt
  RentaCustomer    RentaCustomer[]
  RentaDailyReport RentaDailyReport[]
  User             User[]
}

model RentaDeal {
  id                         Int            @id @default(autoincrement())
  createdAt                  DateTime       @default(now())
  active                     Boolean        @default(true)
  sortOrder                  Float          @default(0)
  detalType                  String?
  orderedAt                  DateTime?
  contractNum                Int?           @unique
  previousContractId         Int?
  contractHasChanged         Boolean        @default(false)
  maintanance                String?
  toyota                     String?
  carType                    String?
  mat                        String?
  invitationFee              Int?
  moneyCollectionScheduledAt DateTime?
  moneyCollectedAt           DateTime?
  willRegisterdAt            DateTime?
  dlOrder                    String?
  orderPaperSubmittedAt      DateTime?
  contractPaperSubmittedAt   DateTime?
  registerPaperSubmittedAt   DateTime?
  storeNote                  String?
  error                      String?
  orderPaperReturnedAt       DateTime?
  contractPaperReturnedAt    DateTime?
  registeredAt               DateTime?
  scannedAt                  DateTime?
  storeNote2                 String?
  contractPrice              Int?
  ProfitPrice                Int?
  userId                     Int
  tentativeRegisteredAt      DateTime?
  rentaCustomerId            Int?
  updatedAt                  DateTime?      @updatedAt
  RentaCustomer              RentaCustomer? @relation(fields: [rentaCustomerId], references: [id], onDelete: Cascade)
  User                       User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([rentaCustomerId])
  @@index([userId])
}

model RentaDailyReport {
  id                         Int             @id @default(autoincrement())
  createdAt                  DateTime        @default(now())
  active                     Boolean         @default(true)
  sortOrder                  Float           @default(0)
  Memo                       String?
  date                       DateTime?
  time                       String?
  visitType                  String?
  increasedNegotiationsCount Int?
  remarks                    String?
  userId                     Int
  rentaStoreId               Int
  rentaCustomerId            Int?
  introductionAchieved       Boolean?        @default(false)
  approachType               String?
  updatedAt                  DateTime?       @updatedAt
  useHoujinDb                Boolean?        @default(false)
  AlternateInfo              AlternateInfo[]
  ExtraInfo                  ExtraInfo[]
  InsuranceInfo              InsuranceInfo[]
  Outcome                    Outcome[]
  Purpose                    Purpose[]
  RentaCustomer              RentaCustomer?  @relation(fields: [rentaCustomerId], references: [id], onDelete: Cascade)
  RentaStore                 RentaStore      @relation(fields: [rentaStoreId], references: [id], onDelete: Cascade)
  User                       User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([rentaCustomerId])
  @@index([rentaStoreId])
  @@index([userId])
}

model RentaCustomer {
  id                     Int                @id @default(autoincrement())
  createdAt              DateTime           @default(now())
  sortOrder              Float              @default(0)
  name                   String?
  code                   String?            @unique
  userId                 Int
  carCount               Int?
  type                   String?
  address1               String?
  address2               String?
  fax                    String?
  industryCode           String?
  industryCodeName       String?
  kana                   String?
  nameBottom             String?
  nameTop                String?
  phone                  String?
  postalCode             String?
  rentaStoreId           Int?
  repKana                String?
  repName                String?
  repPos                 String?
  leaseCompanyName       String?
  result                 String?
  maintenanceDestination String?
  remarks                String?
  pic                    String?
  rentaReferenceId       Int?
  updatedAt              DateTime?          @updatedAt
  mergeCandidatesIds     Int[]
  AlternateInfo          AlternateInfo[]
  ExtraInfo              ExtraInfo[]
  InsuranceInfo          InsuranceInfo[]
  RefFrom                RefFrom[]
  RefTo                  RefTo[]
  RentaStore             RentaStore?        @relation(fields: [rentaStoreId], references: [id], onDelete: Cascade)
  User                   User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  RentaDailyReport       RentaDailyReport[]
  RentaDeal              RentaDeal[]
  RentaReference         RentaReference[]

  @@index([rentaStoreId])
  @@index([userId])
}

model RentaReference {
  id              Int           @id @default(autoincrement())
  createdAt       DateTime      @default(now())
  sortOrder       Float         @default(0)
  date            DateTime?
  remarks         String?
  rentaCustomerId Int
  refFromId       Int           @unique
  refToId         Int           @unique
  updatedAt       DateTime?     @updatedAt
  RefFrom         RefFrom       @relation(fields: [refFromId], references: [id], onDelete: Cascade)
  RefTo           RefTo         @relation(fields: [refToId], references: [id], onDelete: Cascade)
  RentaCustomer   RentaCustomer @relation(fields: [rentaCustomerId], references: [id], onDelete: Cascade)

  @@unique([rentaCustomerId, refFromId, refToId], name: "unique_rentaCustomerId_refFromId_refToId")
}

model RefFrom {
  id              Int             @id @default(autoincrement())
  createdAt       DateTime        @default(now())
  sortOrder       Float           @default(0)
  rentaCustomerId Int
  updatedAt       DateTime?       @updatedAt
  RentaCustomer   RentaCustomer   @relation(fields: [rentaCustomerId], references: [id], onDelete: Cascade)
  RentaReference  RentaReference?

  @@index([rentaCustomerId])
}

model RefTo {
  id              Int             @id @default(autoincrement())
  createdAt       DateTime        @default(now())
  sortOrder       Float           @default(0)
  rentaCustomerId Int
  updatedAt       DateTime?       @updatedAt
  RentaCustomer   RentaCustomer   @relation(fields: [rentaCustomerId], references: [id], onDelete: Cascade)
  RentaReference  RentaReference?

  @@index([rentaCustomerId])
}

model Purpose {
  id                 Int               @id @default(autoincrement())
  createdAt          DateTime          @default(now())
  sortOrder          Float             @default(0)
  rentaDailyReportId Int?
  purposeMasterId    Int
  date               DateTime?
  userId             Int?
  updatedAt          DateTime?         @updatedAt
  PurposeMaster      PurposeMaster     @relation(fields: [purposeMasterId], references: [id], onDelete: Cascade)
  RentaDailyReport   RentaDailyReport? @relation(fields: [rentaDailyReportId], references: [id], onDelete: Cascade)
  User               User?             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([purposeMasterId])
  @@index([rentaDailyReportId])
  @@index([userId])
}

model PurposeMaster {
  id          Int       @id @default(autoincrement())
  createdAt   DateTime  @default(now())
  sortOrder   Float     @default(0)
  name        String    @unique
  type        String?
  color       String
  userId      Int?
  aggregateAs String?
  updatedAt   DateTime? @updatedAt
  Purpose     Purpose[]
  User        User?     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Outcome {
  id                 Int               @id @default(autoincrement())
  createdAt          DateTime          @default(now())
  sortOrder          Float             @default(0)
  rentaDailyReportId Int?
  outcomeMasterId    Int
  date               DateTime?
  userId             Int?
  updatedAt          DateTime?         @updatedAt
  OutcomeMaster      OutcomeMaster     @relation(fields: [outcomeMasterId], references: [id], onDelete: Cascade)
  RentaDailyReport   RentaDailyReport? @relation(fields: [rentaDailyReportId], references: [id], onDelete: Cascade)
  User               User?             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([outcomeMasterId])
  @@index([rentaDailyReportId])
  @@index([userId])
}

model OutcomeMaster {
  id          Int       @id @default(autoincrement())
  createdAt   DateTime  @default(now())
  sortOrder   Float     @default(0)
  name        String    @unique
  type        String?
  color       String
  userId      Int?
  aggregateAs String?
  updatedAt   DateTime? @updatedAt
  Outcome     Outcome[]
  User        User?     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model AlternateInfo {
  id                 Int               @id @default(autoincrement())
  createdAt          DateTime          @default(now())
  sortOrder          Float             @default(0)
  carName            String?
  dueDate            DateTime?
  type               String?
  rentaDailyReportId Int?
  rentaCustomerId    Int?
  isRead             Boolean?          @default(false)
  isRead2            Boolean?          @default(false)
  updatedAt          DateTime?         @updatedAt
  RentaCustomer      RentaCustomer?    @relation(fields: [rentaCustomerId], references: [id], onDelete: Cascade)
  RentaDailyReport   RentaDailyReport? @relation(fields: [rentaDailyReportId], references: [id], onDelete: Cascade)

  @@index([rentaCustomerId])
  @@index([rentaDailyReportId])
}

model InsuranceInfo {
  id                 Int               @id @default(autoincrement())
  createdAt          DateTime          @default(now())
  sortOrder          Float             @default(0)
  insuranceCompany   String?
  dueDate            DateTime?
  imageUrl           String?
  rentaDailyReportId Int?
  rentaCustomerId    Int?
  isRead             Boolean?          @default(false)
  isRead2            Boolean?          @default(false)
  updatedAt          DateTime?         @updatedAt
  RentaCustomer      RentaCustomer?    @relation(fields: [rentaCustomerId], references: [id], onDelete: Cascade)
  RentaDailyReport   RentaDailyReport? @relation(fields: [rentaDailyReportId], references: [id], onDelete: Cascade)

  @@index([rentaDailyReportId])
  @@index([rentaCustomerId])
}

model ExtraInfo {
  id                 Int               @id @default(autoincrement())
  createdAt          DateTime          @default(now())
  sortOrder          Float             @default(0)
  date               DateTime?
  remarks            String?
  imageUrl           String?
  rentaDailyReportId Int?
  rentaCustomerId    Int
  isRead             Boolean?          @default(false)
  isRead2            Boolean?          @default(false)
  updatedAt          DateTime?         @updatedAt
  RentaCustomer      RentaCustomer     @relation(fields: [rentaCustomerId], references: [id], onDelete: Cascade)
  RentaDailyReport   RentaDailyReport? @relation(fields: [rentaDailyReportId], references: [id], onDelete: Cascade)

  @@index([rentaCustomerId])
  @@index([rentaDailyReportId])
}

model Ucar {
  id                   Int       @id @default(autoincrement())
  createdAt            DateTime  @default(now())
  updatedAt            DateTime? @updatedAt
  qrIssuedAt           DateTime?
  processLastUpdatedAt DateTime?
  active               Boolean   @default(true)
  sortOrder            Float     @default(0)
  sateiDataConfirmedAt DateTime?

  sateiID String @unique @default(uuid())

  //Ai_Satei
  Model_name                   String?
  brand_name                   String?
  Common_name_model            String?
  Barracks                     String?
  Model_year                   String?
  Scheduled_arrival_date       DateTime?
  Number_Place_name            String?
  Number_classification_number String?
  Number_Hiragana              String?
  number                       String?
  Vehicle_length               Float?
  Vehicle_width                Float?
  Vehicle_height               Float?

  number98    String?
  DD_SIIRE    String?
  NO_SIRETYUM String?

  // // 古物台帳DB
  APPINDEX         String?
  KI_HANKAKA       Int?
  CD_ZAIKOTEN_NAME String?
  CD_ZAIKOTEN      String?
  DT_SAISINUP      String?
  NO_SYARYOU       String?

  garageProvedAt DateTime?

  // 書類管理項目
  arrivedAt    DateTime?
  passedAt     DateTime?
  customerName String?

  meihenBi       DateTime?
  masshoBi       DateTime?
  secondMeihenbi DateTime? //二次登録日

  // meihenMasshoShoribi DateTime? //名変抹消はこちらに統一

  destination               String?
  inkanCertificateExpiredAt DateTime?
  inspectionExpiredAt       DateTime?
  plate                     String?
  processedAs               String?
  purchaseType              String?
  remarks                   String?
  runnable                  Boolean?
  storeToPickUp             String?

  //銀行情報
  accountName             String?
  accountNumber           String?
  annualTax               Int?
  earlyRecievedAt         DateTime?
  paymentNoticeRecievedAt DateTime?
  isPayed                 Boolean?
  petCount                Int?
  petPrice                Int?
  prefCount               Int?
  prefPrice               Int?
  registerdAt             DateTime?
  taxCustomerName         String?
  taxJobNote              String?
  accountType             String?
  DestinationStore        Store?    @relation(name: "DestinationStore", fields: [destinationStoreId], references: [id], onDelete: Cascade)
  destinationStoreId      Int?

  daihatsuReserve       String?
  exception             String?
  inkanAlternate        String?
  inspectionAlternate   String?
  paymentNoticeRecieved String?
  remarksHq             String?
  upperCarregisteredAt  DateTime?

  User_ID String?

  accountingRecievedAt Boolean?
  paybackScheduledAt   DateTime?

  // UPASSDBにデータがない場合の一時フィールド（tmp{XXXXXX}形式）
  tmpPlate                   String? // プレート番号 (registrationSerialNumber相当)
  tmpVehicleNo               String? // 車両No (NO_SYARYOU相当)
  tmpColor                   String? // 色 (exteriorColor相当)
  tmpModelYear               String? // 年式 (modelYear相当)
  tmpBrandName               String? // ブランド名 (brandName相当)
  tmpModelName               String? // 車種名 (modelName相当)
  tmpGrade                   String? // グレード (grade相当)
  tmpType                    String? // 型式 (type相当)
  tmpCommonType              String? // 通称型式 (commonType相当)
  tmpFrameNumber             String? // フレーム番号 (frameNumber相当)
  tmpTransmissionType        String? // ミッション名称 (transmissionType相当)
  tmpRegistrationClassNumber String? // 分類番号
  tmpRegistrationKana        String? // かな
  tmpLandAffairsName         String? // 陸事名

  modified_brandName     String? //店舗査定_ブランド名称
  modified_modelName     String? //店舗査定_車種名称
  modified_frameNumber   String? //店舗査定_フレーム��
  modified_chassisNumber String? //店舗査定_車台番号
  modified_type          String? //型式
  modified_grade         String? //グレード
  modified_modelYear     String? //モデル年式
  modified_length        String? //車寸（長さ）
  modified_width         String? //車寸（幅）
  modified_height        String? //車寸（高さ）

  // リレーション
  Number98 Number98? @relation(fields: [number98], references: [number])

  QR_Prosess         QR_Prosess?
  UcarPaperWorkNotes UcarPaperWorkNotes[]
  UcarProcess        UcarProcess[]

  AppliedUcarGarageSlot   AppliedUcarGarageSlot?
  ucarLastProcessMasterId Int?

  BankMaster   BankMaster? @relation(fields: [bankMasterId], references: [id], onDelete: Cascade)
  bankMasterId Int?

  yuchoShitenNo String?

  BankBranchMaster   BankBranchMaster? @relation(fields: [bankBranchMasterId], references: [id], onDelete: Cascade)
  bankBranchMasterId Int?
  User               User?             @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId             Int?

  Store   Store? @relation(fields: [storeId], references: [id], onDelete: Cascade)
  storeId Int?

  TmpRentalStore   Store? @relation(name: "TmpRentalStore", fields: [tmpRentalStoreId], references: [id], onDelete: Cascade)
  tmpRentalStoreId Int?

  NewCar   NewCar? @relation(fields: [newCarId], references: [id], onDelete: Cascade)
  newCarId Int?

  UPASS UPASS? @relation(fields: [sateiID], references: [sateiID], onDelete: Cascade)

  OldCars_Base OldCars_Base? @relation(fields: [number98, NO_SYARYOU, DD_SIIRE], references: [NO_SIRETYUM, NO_SYARYOU, DD_SIIRE])

  @@unique([number98, NO_SYARYOU, DD_SIIRE])
  @@index([bankBranchMasterId])
  @@index([bankMasterId])
  @@index([userId])
  @@index([storeId])
  @@index([newCarId])
  @@index([number98])
  @@index([sateiID])
  @@index([destinationStoreId])
  @@index([tmpRentalStoreId])
}

model Number98 {
  id         Int       @id @default(autoincrement())
  createdAt  DateTime  @default(now())
  updatedAt  DateTime? @updatedAt
  active     Boolean   @default(true)
  sortOrder  Float     @default(0)
  number     String    @unique
  sortNumber Int?
  occupied   Boolean?  @default(false)

  Ucar         Ucar[]
  OldCars_Base OldCars_Base[]
  // ZAIKO_Base   ZAIKO_Base[]
}

model UcarGarageLocationMaster {
  id                   Int                    @id @default(autoincrement())
  createdAt            DateTime               @default(now())
  updatedAt            DateTime?              @updatedAt
  active               Boolean                @default(true)
  sortOrder            Float                  @default(0)
  name                 String                 @unique
  UcarGarageSlotMaster UcarGarageSlotMaster[]
}

model UcarGarageSlotMaster {
  id                         Int                       @id @default(autoincrement())
  createdAt                  DateTime                  @default(now())
  updatedAt                  DateTime?                 @updatedAt
  active                     Boolean                   @default(true)
  sortOrder                  Float                     @default(0)
  garageNumber               Int
  ucarGarageLocationMasterId Int?
  AppliedUcarGarageSlot      AppliedUcarGarageSlot[]
  UcarGarageLocationMaster   UcarGarageLocationMaster? @relation(fields: [ucarGarageLocationMasterId], references: [id], onDelete: Cascade)

  @@unique([garageNumber, ucarGarageLocationMasterId], name: "unique_garageNumber_ucarGarageLocationMasterId")
  @@index([ucarGarageLocationMasterId])
}

model AppliedUcarGarageSlot {
  id                     Int                  @id @default(autoincrement())
  createdAt              DateTime             @default(now())
  updatedAt              DateTime?            @updatedAt
  active                 Boolean              @default(true)
  sortOrder              Float                @default(0)
  appliedAt              DateTime
  finishedAt             DateTime?
  ucarGarageSlotMasterId Int
  ucarId                 Int                  @unique
  UcarGarageSlotMaster   UcarGarageSlotMaster @relation(fields: [ucarGarageSlotMasterId], references: [id], onDelete: Cascade)
  Ucar                   Ucar                 @relation(fields: [ucarId], references: [id], onDelete: Cascade)

  @@unique([ucarId, ucarGarageSlotMasterId], name: "unique_ucarId_ucarGarageSlotMasterId")
  @@index([ucarGarageSlotMasterId])
}

model BankMaster {
  id               Int                @id @default(autoincrement())
  createdAt        DateTime           @default(now())
  updatedAt        DateTime?          @updatedAt
  active           Boolean            @default(true)
  sortOrder        Float              @default(0)
  code             String             @unique
  name             String
  color            String?
  BankBranchMaster BankBranchMaster[]
  Ucar             Ucar[]
}

model BankBranchMaster {
  id              Int        @id @default(autoincrement())
  createdAt       DateTime   @default(now())
  updatedAt       DateTime?  @updatedAt
  active          Boolean    @default(true)
  sortOrder       Float      @default(0)
  code            String
  name            String
  branchNameShort String?
  branchKana      String?
  searchKana      String?
  color           String?
  bankMasterId    Int
  BankMaster      BankMaster @relation(fields: [bankMasterId], references: [id], onDelete: Cascade)
  Ucar            Ucar[]

  @@unique([code, bankMasterId], name: "unique_code_bankMasterId")
  @@index([bankMasterId])
}

model UcarProcess {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt

  processCode String
  dataSource  String
  date        DateTime? @default(now())
  sortOrder   Float     @default(0)
  // time        String?

  sateiID String?

  remarks String?

  Ucar Ucar? @relation(fields: [sateiID], references: [sateiID], onDelete: Cascade)

  User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId Int

  @@unique([sateiID, date, processCode], name: "unique_sateiID_date_processCode")
  @@index([date])
  @@index([userId])
  @@index([sateiID])
}

model UcarPaperWorkNotes {
  id         Int       @id @default(autoincrement())
  createdAt  DateTime  @default(now())
  active     Boolean   @default(true)
  sortOrder  Float     @default(0)
  userId     Int
  ucarId     Int
  type       String?
  content    String?
  resolvedAt DateTime?

  updatedAt DateTime? @updatedAt
  Ucar      Ucar      @relation(fields: [ucarId], references: [id], onDelete: Cascade)
  User      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([ucarId])
}


`;

export const prismaDMMF = {
  "enums": [],
  "models": [
    {
      "name": "Car",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "processLastUpdatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bpNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderStatusCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "plate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "frame",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "katashiki",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "managementCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "initDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "currentEstimate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "scheduledAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "insuranceType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "insuranceCompany",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "agreedPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "crUserId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "damageNameMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "crScheduledAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "representativeCarBpNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "favoredByUserIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prePermission",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "preStart",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "BP",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "advancePayment",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "complexKey",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DamageNameMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DamageNameMaster",
          "nativeType": null,
          "relationName": "CarToDamageNameMaster",
          "relationFromFields": [
            "damageNameMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "CarToStore",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "CarToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CrUser",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CrUser",
          "nativeType": null,
          "relationName": "CarToCrUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Notes",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Notes",
          "nativeType": null,
          "relationName": "CarToNotes",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Process",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Process",
          "nativeType": null,
          "relationName": "CarToProcess",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Slot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Slot",
          "nativeType": null,
          "relationName": "CarToSlot",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "UserProcessConfirmation",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "checked",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToUserProcessConfirmation",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "userId",
          "date"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_userId_date",
          "fields": [
            "userId",
            "date"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Notes",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "content",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "settled",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "noteNameMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Car",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Car",
          "nativeType": null,
          "relationName": "CarToNotes",
          "relationFromFields": [
            "carId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NoteNameMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NoteNameMaster",
          "nativeType": null,
          "relationName": "NoteNameMasterToNotes",
          "relationFromFields": [
            "noteNameMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "NotesToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DamageNameMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carPerDay",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 3,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Car",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Car",
          "nativeType": null,
          "relationName": "CarToDamageNameMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "DamageNameMasterToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "NoteNameMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Notes",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Notes",
          "nativeType": null,
          "relationName": "NoteNameMasterToNotes",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "BpSummary",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "key",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "label",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "count",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "BpSummaryToStore",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "date",
          "key",
          "storeId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_date_key_storeId",
          "fields": [
            "date",
            "key",
            "storeId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "ProcessNameMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "onEnginerProcess",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "repetitionLimit",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Process",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Process",
          "nativeType": null,
          "relationName": "ProcessToProcessNameMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Process",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "time",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "processNameMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Car",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Car",
          "nativeType": null,
          "relationName": "CarToProcess",
          "relationFromFields": [
            "carId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProcessNameMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ProcessNameMaster",
          "nativeType": null,
          "relationName": "ProcessToProcessNameMaster",
          "relationFromFields": [
            "processNameMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "ProcessToStore",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "ProcessToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "ReleaseNotes",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rootPath",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "msg",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "imgUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "confirmedUserIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CrUser",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Car",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Car",
          "nativeType": null,
          "relationName": "CarToCrUser",
          "relationFromFields": [
            "carId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "CrUserToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "carId",
          "userId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_carId_userId",
          "fields": [
            "carId",
            "userId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "JuchuShitadoriDb",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "APPINDEX",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "JuchuShitadoriDbToNewCar",
          "relationFromFields": [
            "APPINDEX_FKEY"
          ],
          "relationToFields": [
            "APPINDEX"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UPASS",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UPASS",
          "nativeType": null,
          "relationName": "JuchuShitadoriDbToUPASS",
          "relationFromFields": [
            "NO_SATEISYO"
          ],
          "relationToFields": [
            "sateiID"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "APPINDEX_FKEY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_KAISYA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SINCYU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_CYUMON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_CYUMONED",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SITARENB",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SITASNSY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_NORIKUSI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_NOSYASYU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_NOGYOTAI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_NOSEIRI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_RIKUSI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_MITRCHUB",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SATEISYO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SITERUIB",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SATEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SYARYOU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITADKAK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NU_JIBAIMIK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NU_ZEIRITU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SITASYHI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITASYHI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITATHU1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITATHU2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITATHU3",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_SITADOSY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SYKNMANR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SU_SYNDOTOR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SITKATA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_FURUKATA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_FURON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SYADAIBA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NU_SOUKOUKM",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_SIYOSYA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_SYYUMAI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_ZANSEKSA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_ZANSEKSA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_KANSAIYO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_KAIKESAI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITAKESA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_SITAMEMO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_JIDZMNOH",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_YOTAKU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_AZRECYYO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SYRDST",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_AIRBAGRU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_FURONR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_JOHOKR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SIKNKNR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_RECYCLEK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SIYZJDHT",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_SAISSYYU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SIYZJDHI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_STJIZESO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SIYZSHIF",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_HIKIZUMF",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SITATORI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SITAJOJO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_KYUSATEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DT_SAISINUP",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SASINTAN",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "N_JUCYU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "U_JUCYU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_SYAMEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "OldCars_Base",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "APPINDEX",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_21SYAMEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SYAMEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_HANSTAFF",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_HANTENPO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SIRETYUM",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SIRENORI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SIRETOSY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_SIRETOGY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SIRETOSE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_HANJTRIK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_HANTOSY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_HANTOGY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_HANTOSE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_SITASTAF",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SIIRE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SIREBD",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SU_SYODOTOR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_FRAME",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SIIREKA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_HANKAKA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SIIRE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SIHARAI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_URIAGE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_CYUMON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_CYUMONED",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SYARYOU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SYADAIBA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DT_SAISINUP",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_KATASIKI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NU_SOUKOUKM",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_SIRETENP",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_SIRESAKI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_UC1JTORO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_URIAGE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_1JTOROKU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_2JTOROKU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SYKNMANR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SITASYUK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_NOSYA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SITADOTE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Number98",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Number98",
          "nativeType": null,
          "relationName": "Number98ToOldCars_Base",
          "relationFromFields": [
            "NO_SYARYOU"
          ],
          "relationToFields": [
            "number"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "OldCars_BaseToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ZAIKO_Base",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ZAIKO_Base",
          "nativeType": null,
          "relationName": "OldCars_BaseToZAIKO_Base",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "NO_SIRETYUM",
          "NO_SYARYOU",
          "DD_SIIRE"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "NO_SIRETYUM",
            "NO_SYARYOU",
            "DD_SIIRE"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "ZAIKO_Base",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "APPINDEX",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "APPINDEX_FKEY",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SYARYOU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SIIRE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_KEIRIKEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SIRETYUM",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SIRENORI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SIRETOSY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_SIRETOGY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SIRETOSE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SIRESAKI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_SITADOTE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_SITASTAF",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_SIRETENP",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_FURUSYAM",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_KATASIKI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_FRAME",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_TENJTENP",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_HNBSIJIK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_TENTOHYJ",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_ZAIKSYYS",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_SYASYHAN",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SYADAIBA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SIIREKA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KN_KEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_ZAIKOST",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_ZAIKOTEN",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_CYUMON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_URIAGE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_HANSTAFF",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_21SYASYS",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_SIJYOKBM",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DT_SAISINUP",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SIIRE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "OldCars_Base",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OldCars_Base",
          "nativeType": null,
          "relationName": "OldCars_BaseToZAIKO_Base",
          "relationFromFields": [
            "NO_SIRETYUM",
            "NO_SYARYOU",
            "DD_SIIRE"
          ],
          "relationToFields": [
            "NO_SIRETYUM",
            "NO_SYARYOU",
            "DD_SIIRE"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "NO_SIRETYUM",
          "NO_SYARYOU",
          "DD_KEIRIKEI"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "NO_SIRETYUM",
            "NO_SYARYOU",
            "DD_KEIRIKEI"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "UpassFamilyTree",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sateiID",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rootSateiID",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sateiDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UPASS",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UPASS",
          "nativeType": null,
          "relationName": "MyUpassTree",
          "relationFromFields": [
            "sateiID"
          ],
          "relationToFields": [
            "sateiID"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RootUpass",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UPASS",
          "nativeType": null,
          "relationName": "RootUpass",
          "relationFromFields": [
            "rootSateiID"
          ],
          "relationToFields": [
            "sateiID"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "sateiID",
          "rootSateiID"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "sateiID",
            "rootSateiID"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "UPASS",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "MyUpassTree",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UpassFamilyTree",
          "nativeType": null,
          "relationName": "MyUpassTree",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RootUpass",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UpassFamilyTree",
          "nativeType": null,
          "relationName": "RootUpass",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dataSource",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "JuchuShitadoriDb",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "JuchuShitadoriDb",
          "nativeType": null,
          "relationName": "JuchuShitadoriDbToUPASS",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sateiID",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dealerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dealerCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentMode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentMode2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "palAssessmentNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "landAffairsName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "registrationClassNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "registrationKana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "registrationSerialNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "registrationDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "firstRegistrationDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modelYear",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modelYearType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "chassisNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "frameNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "brandName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modelName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ai21ModelCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "grade",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "commonType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "engineType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "vehicleHistory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "capacityMin",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "capacityMax",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "maxLoad",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "weight",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "grossWeight",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "length",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "width",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "height",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "displacement",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fuelName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "typeDesignationNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "categoryNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ownerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "useOwnershipSameFlag",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ai21CustomerCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerKanaSurname",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerKanaName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inspectionExpiryDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "odometerDisplayValue",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarWarranty",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "maintenanceManual",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "instructionManual",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "periodicInspectionRecord",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unexpiredLiabilityAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "liabilityInsuranceStartDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "liabilityInsuranceEndDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unexpiredTaxAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recyclingCertificate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recyclingCertificateNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shredderDustFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "airbagFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "freonFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "infoManagementFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recyclingDeposit",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "importCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bodyType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "driveType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "transmissionType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "steering",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "doorType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "coldWeatherSpec",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "exteriorColor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "colorCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "colorName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "interiorColor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "repairHistory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mileageKm",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "meterReplacement",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalMileage",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "importVehicle",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modelYearDetail",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sunroofMoonroof",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "frontAc",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rearAc",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "powerSteering",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "powerWindow",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "abs",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "electricSlideDoor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "seatMaterial",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "airbagFeeDetail",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carNaviDa",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tv",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rearMonitor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "backMonitor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cd",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dvd",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mediaPlayer",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rearEntertainment",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "markLevinson",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "aeroSpoiler",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "aluminumWheel",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cruiseControl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "skidControl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "immobilizer",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "powerSeat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fullFlat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "benchSeat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "threeRowSeat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "walkThrough",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lowDown",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "headlamp",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "keylessEntry",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remoteStarter",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "etc",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "oneOwner",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "testDrive",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "activeStabilizer",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "collisionAvoidance",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pedalMisstep",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "laneDeparture",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "advancedLight",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "blindSpotMonitor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "panoramicViewMonitor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "driveRecorder",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "idling",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "outlet",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "additionalEquipment1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "additionalEquipment2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "additionalEquipment3",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "additionalEquipment4",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "additionalEquipment5",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "evFlag",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "reFlag",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ac",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "navi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tv2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "leather",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sr",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "aluminum",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentdatetime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tradeInPurchaseCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pickupScheduledDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "requestingName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "requestingCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentname",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentcode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentStaffName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentStaffCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "salesname",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "salescode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "salesStaffName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "salesStaffCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "plannedPurchaseVehicle",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "residualValueInstallmentFinalDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "residualValueInstallmentFinalAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "urgencyStatus",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationContactNotes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationRequestDatetime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "comprehensiveEvaluationScore",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentAdjustmentPointsTotal",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarPriceExcludingTax",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmountTotal",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmount1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmount1Notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmount2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmount2Notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmount3",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmount3Notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmount4",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAmount5",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "approvedPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentResponsePrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inventoryAssessmentResponsePrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessmentError",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationNotesMemo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "salesPriceMemo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "salesStaffContactNotes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationcode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationStoreName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationEmployeeCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inspectionname",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inspectioncode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pricingStoreName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pricecode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inspectioName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inspectionNameCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pricingPersonName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pricingPersonCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationResponsedatetime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationStarttime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationEndtime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "valuationRequiredtime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "priceConfirmationdatetime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inventoryAssessmentConfirmationdate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "previousValuationnumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "previousAssessmentnumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cpoCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "UPASSToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "QR_Prosess",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sateiId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Sorting_results",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_0",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email_0",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "store_0",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "runnable_0",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks_0",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shitadoriKubun_0",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderNumber_0",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_3",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_4",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_6",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_7",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_8",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_9",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_11",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_12",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_13",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "datetime_14",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "max_update",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "QR_ProsessToUcar",
          "relationFromFields": [
            "sateiId"
          ],
          "relationToFields": [
            "sateiID"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DeliverSchedule",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "LoadingVehicle",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "LoadingVehicle",
          "nativeType": null,
          "relationName": "DeliverScheduleToLoadingVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Area",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "LoadingVehicle",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "LoadingVehicle",
          "nativeType": null,
          "relationName": "AreaToLoadingVehicle",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "AreaToStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "LoadingVehicle",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliverScheduleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "areaId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pickedCarIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "slot",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Area",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Area",
          "nativeType": null,
          "relationName": "AreaToLoadingVehicle",
          "relationFromFields": [
            "areaId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DeliverSchedule",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DeliverSchedule",
          "nativeType": null,
          "relationName": "DeliverScheduleToLoadingVehicle",
          "relationFromFields": [
            "deliverScheduleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Slot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Slot",
          "nativeType": null,
          "relationName": "LoadingVehicleToSlot",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Slot",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "loadingVehicleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Car",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Car",
          "nativeType": null,
          "relationName": "CarToSlot",
          "relationFromFields": [
            "carId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "LoadingVehicle",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "LoadingVehicle",
          "nativeType": null,
          "relationName": "LoadingVehicleToSlot",
          "relationFromFields": [
            "loadingVehicleId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToSlot",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "NewCar",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "APPINDEX",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_HANSTAFF",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_NCSYAMEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_TENPO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_CENTTYAB",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_CENTYOB",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_FR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_HAISKIBO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_HAISOU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_HAISOYOT",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_HONBSYOK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_JUCYU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_JUCYUKE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_KIBONOKI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_MAKERSYU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_NOSYA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SYOUNIN1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SYOUNIN2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SYOUNIN3",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_TENPSYOK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_TOROKIBO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_TOTYAKUY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_TOUROKU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_URIKZUMI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_KAINMEI1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_KURUMAME",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_MEIGIME1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_HANTENKT",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_CYUMON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_FRAME",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m0Status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m0_deadline_nousya",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m0_remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m1Status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m1_deadline_money",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m1_deadline_paper",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m1_remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m2Status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m2_date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m2_remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m1Alert",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m2Alert",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lastApprovedDesiredTorokuDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m2_check1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m2_check2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "m1_toroku_prediction",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "initial_m0_deadline_nousya",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "initial_m1_deadline_money",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "initial_m1_deadline_paper",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "initial_m1_toroku_prediction",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_KARINOKI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SAGTYYO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_OSSSIN",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_OSSTSNST",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_BETSIHAK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_MAEUNYUK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_NYURUIKE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SHRIGK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITANYKG",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "crOperationRemarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "haisou_tooEarly",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "torokuApplicationRequired",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_CENTSYUB",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_GENSYNYK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITADORI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_SITZAN",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_TORIKESI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_MAX_UPDATE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "earliestHaisouDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_LATEST_HAISOU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_HAISYYO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_KANSEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_KRHURI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_DAIHYNAI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TM_TOTUTMKE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_DD_SEISANYOTEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_FR_DATE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_FR_KARI_NOTATION",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_FR_NOTATION_TYPE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_FR_PREFIX",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_FR_SUFFIX",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_KB_GYOCYOK",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_KB_SEIBETU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_SEISANYOTEI",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_ZAIKO_KB_NOTATION",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_paymentCheck",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_paymentCheckCustomerType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CUSTOM_NET_SHITADORI_PRICE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KB_ZAIKOJYO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDaikoNosya",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sateiNyukobiAlert",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shitadoriAlertCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ossSpreadsheetUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "transferType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "可能",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CrInspectionHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CrInspectionHistory",
          "nativeType": null,
          "relationName": "CrInspectionHistoryToNewCar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DesiredTorokuDate",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DesiredTorokuDate",
          "nativeType": null,
          "relationName": "DesiredTorokuDateToNewCar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "OrderSwitchingHisotory",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OrderSwitchingHisotory",
          "nativeType": null,
          "relationName": "NewCarToOrderSwitchingHisotory",
          "relationFromFields": [
            "orderSwitchingHisotoryId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderSwitchingHisotoryId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "NewCarToStore",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "NewCarToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCarLeadTime",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCarLeadTime",
          "nativeType": null,
          "relationName": "NewCarToNewCarLeadTime",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Slot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Slot",
          "nativeType": null,
          "relationName": "NewCarToSlot",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "NewCarToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SeisanYoteiHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SeisanYoteiHistory",
          "nativeType": null,
          "relationName": "NewCarToSeisanYoteiHistory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "FuriateStatusOnApprovement",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "FuriateStatusOnApprovement",
          "nativeType": null,
          "relationName": "FuriateStatusOnApprovementToNewCar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CarTransferHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CarTransferHistory",
          "nativeType": null,
          "relationName": "CarTransferHistoryToNewCar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TenpoTsuikoShinseiHeader",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TenpoTsuikoShinseiHeader",
          "nativeType": null,
          "relationName": "NewCarToTenpoTsuikoShinseiHeader",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TenpoTsuikoData",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TenpoTsuikoData",
          "nativeType": null,
          "relationName": "NewCarToTenpoTsuikoData",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "JuchuShitadoriDb",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "JuchuShitadoriDb",
          "nativeType": null,
          "relationName": "JuchuShitadoriDbToNewCar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "OrderSwitchingHisotory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToOrderSwitchingHisotory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "OrderSwitchingHisotoryToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DesiredTorokuDate",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "torokuType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "DesiredTorokuDateToNewCar",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "NewCarLeadTime",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "key",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "value",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToNewCarLeadTime",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "newCarId",
          "key"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "newCarId_key_unique",
          "fields": [
            "newCarId",
            "key"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "CrInspectionHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "CrInspectionHistoryToNewCar",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "CrInspectionHistoryToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SeisanYoteiHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "key",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToSeisanYoteiHistory",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "from",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "to",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fromDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "toDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "issuedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notifyedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "UserProgressAggregationTable",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "timing",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "label",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "count",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "StoreToUserProgressAggregationTable",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToUserProgressAggregationTable",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "date",
          "userId",
          "timing",
          "label"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "date_userId_timing_label_unique",
          "fields": [
            "date",
            "userId",
            "timing",
            "label"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "ProgressAggregationTable",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "ProgressAggregationTableToStore",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProgressAggregationTableRecord",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ProgressAggregationTableRecord",
          "nativeType": null,
          "relationName": "ProgressAggregationTableToProgressAggregationTableRecord",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "date",
          "storeId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "date_storeId_unique",
          "fields": [
            "date",
            "storeId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "ProgressAggregationTableRecord",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "timing",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "label",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "count",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProgressAggregationTable",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ProgressAggregationTable",
          "nativeType": null,
          "relationName": "ProgressAggregationTableToProgressAggregationTableRecord",
          "relationFromFields": [
            "progressAggregationTableId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "progressAggregationTableId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "progressAggregationTableId",
          "timing",
          "label"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "progressAggregationTableId_timing_label_unique",
          "fields": [
            "progressAggregationTableId",
            "timing",
            "label"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "FuriateStatusOnApprovement",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "FuriateStatusOnApprovementToNewCar",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_FR",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CarTransferHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "location",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "transferredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "transferConfirmedOnAi21",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recoveredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recoveredConfirmedOnAi21",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "CarTransferHistoryToNewCar",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TenpoTsuikoShinseiHeader",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "approvalOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 1,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToTenpoTsuikoShinseiHeader",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TenpoTsuikoShinseiDetail",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TenpoTsuikoShinseiDetail",
          "nativeType": null,
          "relationName": "TenpoTsuikoShinseiDetailToTenpoTsuikoShinseiHeader",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TenpoTsuikoShinseiDetail",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "waiting",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "comment",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "approvalOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tenpoTsuikoShinseiHeaderId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "processedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "TenpoTsuikoShinseiDetailToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TenpoTsuikoShinseiHeader",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TenpoTsuikoShinseiHeader",
          "nativeType": null,
          "relationName": "TenpoTsuikoShinseiDetailToTenpoTsuikoShinseiHeader",
          "relationFromFields": [
            "tenpoTsuikoShinseiHeaderId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TenpoTsuikoData",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "APPINDEX",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "APPINDEX_FKEY",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_TUIKO",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "MJ_TUIKOM",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_TUIKOKIN",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_TENPO",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_HANSTAFF",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_KURUMAME",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_CYUMON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KJ_KAINMEI1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToTenpoTsuikoData",
          "relationFromFields": [
            "APPINDEX_FKEY"
          ],
          "relationToFields": [
            "APPINDEX"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "processed",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "processedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Store",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "areaId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "tel",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fax",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "BpSummary",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "BpSummary",
          "nativeType": null,
          "relationName": "BpSummaryToStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Car",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Car",
          "nativeType": null,
          "relationName": "CarToStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Process",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Process",
          "nativeType": null,
          "relationName": "ProcessToStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Area",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Area",
          "nativeType": null,
          "relationName": "AreaToStore",
          "relationFromFields": [
            "areaId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "StoreToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "StoreToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProgressAggregationTable",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ProgressAggregationTable",
          "nativeType": null,
          "relationName": "ProgressAggregationTableToStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserProgressAggregationTable",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserProgressAggregationTable",
          "nativeType": null,
          "relationName": "StoreToUserProgressAggregationTable",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DestinatedUcar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "DestinationStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TmpRentalUcar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "TmpRentalStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "User",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "password",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "role",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "ユーザー",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tempResetCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tempResetCodeExpired",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schoolId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shopId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "membershipName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "damageNameMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tell",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "app",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "apps",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "loginCheck",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Car",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Car",
          "nativeType": null,
          "relationName": "CarToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CrInspectionHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CrInspectionHistory",
          "nativeType": null,
          "relationName": "CrInspectionHistoryToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CrUser",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CrUser",
          "nativeType": null,
          "relationName": "CrUserToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Notes",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Notes",
          "nativeType": null,
          "relationName": "NotesToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "OrderSwitchingHisotory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OrderSwitchingHisotory",
          "nativeType": null,
          "relationName": "OrderSwitchingHisotoryToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Outcome",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Outcome",
          "nativeType": null,
          "relationName": "OutcomeToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "OutcomeMaster",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OutcomeMaster",
          "nativeType": null,
          "relationName": "OutcomeMasterToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Process",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Process",
          "nativeType": null,
          "relationName": "ProcessToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Purpose",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Purpose",
          "nativeType": null,
          "relationName": "PurposeToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "PurposeMaster",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "PurposeMaster",
          "nativeType": null,
          "relationName": "PurposeMasterToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "RentaCustomerToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDailyReport",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDailyReport",
          "nativeType": null,
          "relationName": "RentaDailyReportToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDeal",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDeal",
          "nativeType": null,
          "relationName": "RentaDealToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "UcarToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UcarPaperWorkNotes",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UcarPaperWorkNotes",
          "nativeType": null,
          "relationName": "UcarPaperWorkNotesToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UcarProcess",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UcarProcess",
          "nativeType": null,
          "relationName": "UcarProcessToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DamageNameMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DamageNameMaster",
          "nativeType": null,
          "relationName": "DamageNameMasterToUser",
          "relationFromFields": [
            "damageNameMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaStore",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaStore",
          "nativeType": null,
          "relationName": "RentaStoreToUser",
          "relationFromFields": [
            "rentaStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "StoreToUser",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserProcessConfirmation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserProcessConfirmation",
          "nativeType": null,
          "relationName": "UserToUserProcessConfirmation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserRole",
          "nativeType": null,
          "relationName": "UserToUserRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserProgressAggregationTable",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserProgressAggregationTable",
          "nativeType": null,
          "relationName": "UserToUserProgressAggregationTable",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TenpoTsuikoShinseiDetail",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TenpoTsuikoShinseiDetail",
          "nativeType": null,
          "relationName": "TenpoTsuikoShinseiDetailToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "GoogleAccessToken",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tokenJSON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "expiry_date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RoleMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "apps",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserRole",
          "nativeType": null,
          "relationName": "RoleMasterToUserRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "UserRole",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "roleMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RoleMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RoleMaster",
          "nativeType": null,
          "relationName": "RoleMasterToUserRole",
          "relationFromFields": [
            "roleMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToUserRole",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "userId",
          "roleMasterId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "userId_roleMasterId_unique",
          "fields": [
            "userId",
            "roleMasterId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Calendar",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cr",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sharyobu",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "ChainMethodLock",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isLocked",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "expiresAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RentaStore",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "RentaCustomerToRentaStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDailyReport",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDailyReport",
          "nativeType": null,
          "relationName": "RentaDailyReportToRentaStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "RentaStoreToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RentaDeal",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "detalType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contractNum",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "previousContractId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contractHasChanged",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "maintanance",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "toyota",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "invitationFee",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "moneyCollectionScheduledAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "moneyCollectedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "willRegisterdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dlOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderPaperSubmittedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contractPaperSubmittedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "registerPaperSubmittedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeNote",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "error",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderPaperReturnedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contractPaperReturnedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "registeredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "scannedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeNote2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contractPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProfitPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tentativeRegisteredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "RentaCustomerToRentaDeal",
          "relationFromFields": [
            "rentaCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "RentaDealToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RentaDailyReport",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Memo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "time",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "visitType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "increasedNegotiationsCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "introductionAchieved",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "approachType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "useHoujinDb",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AlternateInfo",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "AlternateInfo",
          "nativeType": null,
          "relationName": "AlternateInfoToRentaDailyReport",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ExtraInfo",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ExtraInfo",
          "nativeType": null,
          "relationName": "ExtraInfoToRentaDailyReport",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "InsuranceInfo",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "InsuranceInfo",
          "nativeType": null,
          "relationName": "InsuranceInfoToRentaDailyReport",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Outcome",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Outcome",
          "nativeType": null,
          "relationName": "OutcomeToRentaDailyReport",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Purpose",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Purpose",
          "nativeType": null,
          "relationName": "PurposeToRentaDailyReport",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "RentaCustomerToRentaDailyReport",
          "relationFromFields": [
            "rentaCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaStore",
          "nativeType": null,
          "relationName": "RentaDailyReportToRentaStore",
          "relationFromFields": [
            "rentaStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "RentaDailyReportToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RentaCustomer",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address1",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fax",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "industryCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "industryCodeName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "nameBottom",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "nameTop",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "postalCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "repKana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "repName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "repPos",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "leaseCompanyName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "result",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "maintenanceDestination",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pic",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaReferenceId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "mergeCandidatesIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AlternateInfo",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "AlternateInfo",
          "nativeType": null,
          "relationName": "AlternateInfoToRentaCustomer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ExtraInfo",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ExtraInfo",
          "nativeType": null,
          "relationName": "ExtraInfoToRentaCustomer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "InsuranceInfo",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "InsuranceInfo",
          "nativeType": null,
          "relationName": "InsuranceInfoToRentaCustomer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RefFrom",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RefFrom",
          "nativeType": null,
          "relationName": "RefFromToRentaCustomer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RefTo",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RefTo",
          "nativeType": null,
          "relationName": "RefToToRentaCustomer",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaStore",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaStore",
          "nativeType": null,
          "relationName": "RentaCustomerToRentaStore",
          "relationFromFields": [
            "rentaStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "RentaCustomerToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDailyReport",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDailyReport",
          "nativeType": null,
          "relationName": "RentaCustomerToRentaDailyReport",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDeal",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDeal",
          "nativeType": null,
          "relationName": "RentaCustomerToRentaDeal",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaReference",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaReference",
          "nativeType": null,
          "relationName": "RentaCustomerToRentaReference",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RentaReference",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "refFromId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "refToId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "RefFrom",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RefFrom",
          "nativeType": null,
          "relationName": "RefFromToRentaReference",
          "relationFromFields": [
            "refFromId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RefTo",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RefTo",
          "nativeType": null,
          "relationName": "RefToToRentaReference",
          "relationFromFields": [
            "refToId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "RentaCustomerToRentaReference",
          "relationFromFields": [
            "rentaCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "rentaCustomerId",
          "refFromId",
          "refToId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_rentaCustomerId_refFromId_refToId",
          "fields": [
            "rentaCustomerId",
            "refFromId",
            "refToId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "RefFrom",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "RefFromToRentaCustomer",
          "relationFromFields": [
            "rentaCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaReference",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaReference",
          "nativeType": null,
          "relationName": "RefFromToRentaReference",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RefTo",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "RefToToRentaCustomer",
          "relationFromFields": [
            "rentaCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaReference",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaReference",
          "nativeType": null,
          "relationName": "RefToToRentaReference",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Purpose",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaDailyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "purposeMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "PurposeMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "PurposeMaster",
          "nativeType": null,
          "relationName": "PurposeToPurposeMaster",
          "relationFromFields": [
            "purposeMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDailyReport",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDailyReport",
          "nativeType": null,
          "relationName": "PurposeToRentaDailyReport",
          "relationFromFields": [
            "rentaDailyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "PurposeToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "PurposeMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "aggregateAs",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Purpose",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Purpose",
          "nativeType": null,
          "relationName": "PurposeToPurposeMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "PurposeMasterToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Outcome",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaDailyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "outcomeMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "OutcomeMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OutcomeMaster",
          "nativeType": null,
          "relationName": "OutcomeToOutcomeMaster",
          "relationFromFields": [
            "outcomeMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDailyReport",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDailyReport",
          "nativeType": null,
          "relationName": "OutcomeToRentaDailyReport",
          "relationFromFields": [
            "rentaDailyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "OutcomeToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "OutcomeMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "aggregateAs",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Outcome",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Outcome",
          "nativeType": null,
          "relationName": "OutcomeToOutcomeMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "OutcomeMasterToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "AlternateInfo",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dueDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaDailyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isRead",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isRead2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "AlternateInfoToRentaCustomer",
          "relationFromFields": [
            "rentaCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDailyReport",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDailyReport",
          "nativeType": null,
          "relationName": "AlternateInfoToRentaDailyReport",
          "relationFromFields": [
            "rentaDailyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "InsuranceInfo",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "insuranceCompany",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dueDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "imageUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaDailyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isRead",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isRead2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "InsuranceInfoToRentaCustomer",
          "relationFromFields": [
            "rentaCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDailyReport",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDailyReport",
          "nativeType": null,
          "relationName": "InsuranceInfoToRentaDailyReport",
          "relationFromFields": [
            "rentaDailyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "ExtraInfo",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "imageUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaDailyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isRead",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isRead2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "RentaCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaCustomer",
          "nativeType": null,
          "relationName": "ExtraInfoToRentaCustomer",
          "relationFromFields": [
            "rentaCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RentaDailyReport",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RentaDailyReport",
          "nativeType": null,
          "relationName": "ExtraInfoToRentaDailyReport",
          "relationFromFields": [
            "rentaDailyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Ucar",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "qrIssuedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "processLastUpdatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sateiDataConfirmedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sateiID",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "uuid",
            "args": [
              4
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Model_name",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "brand_name",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Common_name_model",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Barracks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Model_year",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Scheduled_arrival_date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Number_Place_name",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Number_classification_number",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Number_Hiragana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "number",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Vehicle_length",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Vehicle_width",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Vehicle_height",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "number98",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DD_SIIRE",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SIRETYUM",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "APPINDEX",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KI_HANKAKA",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_ZAIKOTEN_NAME",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CD_ZAIKOTEN",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DT_SAISINUP",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NO_SYARYOU",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "garageProvedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "arrivedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "passedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "meihenBi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "masshoBi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "secondMeihenbi",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "destination",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inkanCertificateExpiredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inspectionExpiredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "plate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "processedAs",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "purchaseType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "runnable",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeToPickUp",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "accountName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "accountNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "annualTax",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "earlyRecievedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "paymentNoticeRecievedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isPayed",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "petCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "petPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prefCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prefPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "registerdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "taxCustomerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "taxJobNote",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "accountType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DestinationStore",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "DestinationStore",
          "relationFromFields": [
            "destinationStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "destinationStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "daihatsuReserve",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "exception",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inkanAlternate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inspectionAlternate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "paymentNoticeRecieved",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarksHq",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "upperCarregisteredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User_ID",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "accountingRecievedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Boolean",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "paybackScheduledAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpPlate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpVehicleNo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpColor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpModelYear",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpBrandName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpModelName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpGrade",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpCommonType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpFrameNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpTransmissionType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpRegistrationClassNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpRegistrationKana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpLandAffairsName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_brandName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_modelName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_frameNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_chassisNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_grade",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_modelYear",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_length",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_width",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "modified_height",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Number98",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Number98",
          "nativeType": null,
          "relationName": "Number98ToUcar",
          "relationFromFields": [
            "number98"
          ],
          "relationToFields": [
            "number"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "QR_Prosess",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "QR_Prosess",
          "nativeType": null,
          "relationName": "QR_ProsessToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UcarPaperWorkNotes",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UcarPaperWorkNotes",
          "nativeType": null,
          "relationName": "UcarToUcarPaperWorkNotes",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UcarProcess",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UcarProcess",
          "nativeType": null,
          "relationName": "UcarToUcarProcess",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AppliedUcarGarageSlot",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "AppliedUcarGarageSlot",
          "nativeType": null,
          "relationName": "AppliedUcarGarageSlotToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ucarLastProcessMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "BankMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "BankMaster",
          "nativeType": null,
          "relationName": "BankMasterToUcar",
          "relationFromFields": [
            "bankMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bankMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yuchoShitenNo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "BankBranchMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "BankBranchMaster",
          "nativeType": null,
          "relationName": "BankBranchMasterToUcar",
          "relationFromFields": [
            "bankBranchMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bankBranchMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UcarToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "StoreToUcar",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TmpRentalStore",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "TmpRentalStore",
          "relationFromFields": [
            "tmpRentalStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tmpRentalStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "NewCar",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "NewCar",
          "nativeType": null,
          "relationName": "NewCarToUcar",
          "relationFromFields": [
            "newCarId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UPASS",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UPASS",
          "nativeType": null,
          "relationName": "UPASSToUcar",
          "relationFromFields": [
            "sateiID"
          ],
          "relationToFields": [
            "sateiID"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "OldCars_Base",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OldCars_Base",
          "nativeType": null,
          "relationName": "OldCars_BaseToUcar",
          "relationFromFields": [
            "number98",
            "NO_SYARYOU",
            "DD_SIIRE"
          ],
          "relationToFields": [
            "NO_SIRETYUM",
            "NO_SYARYOU",
            "DD_SIIRE"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "number98",
          "NO_SYARYOU",
          "DD_SIIRE"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "number98",
            "NO_SYARYOU",
            "DD_SIIRE"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Number98",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "number",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "occupied",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "Number98ToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "OldCars_Base",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "OldCars_Base",
          "nativeType": null,
          "relationName": "Number98ToOldCars_Base",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "UcarGarageLocationMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UcarGarageSlotMaster",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UcarGarageSlotMaster",
          "nativeType": null,
          "relationName": "UcarGarageLocationMasterToUcarGarageSlotMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "UcarGarageSlotMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "garageNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ucarGarageLocationMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "AppliedUcarGarageSlot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "AppliedUcarGarageSlot",
          "nativeType": null,
          "relationName": "AppliedUcarGarageSlotToUcarGarageSlotMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UcarGarageLocationMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UcarGarageLocationMaster",
          "nativeType": null,
          "relationName": "UcarGarageLocationMasterToUcarGarageSlotMaster",
          "relationFromFields": [
            "ucarGarageLocationMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "garageNumber",
          "ucarGarageLocationMasterId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_garageNumber_ucarGarageLocationMasterId",
          "fields": [
            "garageNumber",
            "ucarGarageLocationMasterId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "AppliedUcarGarageSlot",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "appliedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "finishedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ucarGarageSlotMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ucarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UcarGarageSlotMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UcarGarageSlotMaster",
          "nativeType": null,
          "relationName": "AppliedUcarGarageSlotToUcarGarageSlotMaster",
          "relationFromFields": [
            "ucarGarageSlotMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "AppliedUcarGarageSlotToUcar",
          "relationFromFields": [
            "ucarId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "ucarId",
          "ucarGarageSlotMasterId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_ucarId_ucarGarageSlotMasterId",
          "fields": [
            "ucarId",
            "ucarGarageSlotMasterId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "BankMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "BankBranchMaster",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "BankBranchMaster",
          "nativeType": null,
          "relationName": "BankBranchMasterToBankMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "BankMasterToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "BankBranchMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "branchNameShort",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "branchKana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "searchKana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bankMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "BankMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "BankMaster",
          "nativeType": null,
          "relationName": "BankBranchMasterToBankMaster",
          "relationFromFields": [
            "bankMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "BankBranchMasterToUcar",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "code",
          "bankMasterId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_code_bankMasterId",
          "fields": [
            "code",
            "bankMasterId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "UcarProcess",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "processCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dataSource",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sateiID",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "remarks",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "UcarToUcarProcess",
          "relationFromFields": [
            "sateiID"
          ],
          "relationToFields": [
            "sateiID"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UcarProcessToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "sateiID",
          "date",
          "processCode"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_sateiID_date_processCode",
          "fields": [
            "sateiID",
            "date",
            "processCode"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "UcarPaperWorkNotes",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ucarId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "content",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "resolvedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "Ucar",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Ucar",
          "nativeType": null,
          "relationName": "UcarToUcarPaperWorkNotes",
          "relationFromFields": [
            "ucarId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UcarPaperWorkNotesToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    }
  ],
  "types": [],
  "indexes": [
    {
      "model": "Car",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Car",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "complexKey"
        }
      ]
    },
    {
      "model": "Car",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "Car",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "Car",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "scheduledAt"
        }
      ]
    },
    {
      "model": "Car",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "crScheduledAt"
        }
      ]
    },
    {
      "model": "Car",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "damageNameMasterId"
        }
      ]
    },
    {
      "model": "UserProcessConfirmation",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UserProcessConfirmation",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_userId_date",
      "fields": [
        {
          "name": "userId"
        },
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "Notes",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Notes",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "noteNameMasterId"
        },
        {
          "name": "carId"
        }
      ]
    },
    {
      "model": "Notes",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "carId"
        }
      ]
    },
    {
      "model": "Notes",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "DamageNameMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DamageNameMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "NoteNameMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "NoteNameMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "BpSummary",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "BpSummary",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "BpSummary",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "date"
        },
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "BpSummary",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "BpSummary",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_date_key_storeId",
      "fields": [
        {
          "name": "date"
        },
        {
          "name": "key"
        },
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "ProcessNameMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ProcessNameMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "ProcessNameMaster",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "Process",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Process",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "processNameMasterId"
        },
        {
          "name": "carId"
        }
      ]
    },
    {
      "model": "Process",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "Process",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "carId"
        }
      ]
    },
    {
      "model": "Process",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "Process",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "ReleaseNotes",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CrUser",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CrUser",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "carId"
        }
      ]
    },
    {
      "model": "CrUser",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "CrUser",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_carId_userId",
      "fields": [
        {
          "name": "carId"
        },
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "JuchuShitadoriDb",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "APPINDEX"
        }
      ]
    },
    {
      "model": "JuchuShitadoriDb",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "JuchuShitadoriDb",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "APPINDEX_FKEY"
        }
      ]
    },
    {
      "model": "JuchuShitadoriDb",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "NO_SATEISYO"
        }
      ]
    },
    {
      "model": "OldCars_Base",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "APPINDEX"
        }
      ]
    },
    {
      "model": "OldCars_Base",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "OldCars_Base",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "APPINDEX"
        }
      ]
    },
    {
      "model": "OldCars_Base",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "NO_SYARYOU"
        }
      ]
    },
    {
      "model": "OldCars_Base",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "NO_SIRETYUM"
        },
        {
          "name": "NO_SYARYOU"
        },
        {
          "name": "DD_SIIRE"
        }
      ]
    },
    {
      "model": "ZAIKO_Base",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "APPINDEX"
        }
      ]
    },
    {
      "model": "ZAIKO_Base",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ZAIKO_Base",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "APPINDEX"
        }
      ]
    },
    {
      "model": "ZAIKO_Base",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "NO_SYARYOU"
        }
      ]
    },
    {
      "model": "ZAIKO_Base",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "CD_ZAIKOTEN"
        }
      ]
    },
    {
      "model": "ZAIKO_Base",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "NO_SIRETYUM"
        },
        {
          "name": "NO_SYARYOU"
        },
        {
          "name": "DD_SIIRE"
        }
      ]
    },
    {
      "model": "ZAIKO_Base",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "NO_SIRETYUM"
        },
        {
          "name": "NO_SYARYOU"
        },
        {
          "name": "DD_KEIRIKEI"
        }
      ]
    },
    {
      "model": "UpassFamilyTree",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UpassFamilyTree",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "sateiID"
        }
      ]
    },
    {
      "model": "UpassFamilyTree",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sateiID"
        },
        {
          "name": "rootSateiID"
        }
      ]
    },
    {
      "model": "UPASS",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UPASS",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "sateiID"
        }
      ]
    },
    {
      "model": "QR_Prosess",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "QR_Prosess",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "sateiId"
        }
      ]
    },
    {
      "model": "QR_Prosess",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sateiId"
        }
      ]
    },
    {
      "model": "DeliverSchedule",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DeliverSchedule",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "Area",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Area",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "LoadingVehicle",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "LoadingVehicle",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "areaId"
        }
      ]
    },
    {
      "model": "LoadingVehicle",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "deliverScheduleId"
        }
      ]
    },
    {
      "model": "Slot",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Slot",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "loadingVehicleId"
        }
      ]
    },
    {
      "model": "Slot",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "carId"
        }
      ]
    },
    {
      "model": "Slot",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "newCarId"
        }
      ]
    },
    {
      "model": "NewCar",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "NewCar",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "APPINDEX"
        }
      ]
    },
    {
      "model": "NewCar",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "orderSwitchingHisotoryId"
        }
      ]
    },
    {
      "model": "NewCar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "NewCar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "OrderSwitchingHisotory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "OrderSwitchingHisotory",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "DesiredTorokuDate",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DesiredTorokuDate",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "newCarId"
        }
      ]
    },
    {
      "model": "NewCarLeadTime",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "NewCarLeadTime",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "newCarId_key_unique",
      "fields": [
        {
          "name": "newCarId"
        },
        {
          "name": "key"
        }
      ]
    },
    {
      "model": "CrInspectionHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CrInspectionHistory",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "newCarId"
        }
      ]
    },
    {
      "model": "CrInspectionHistory",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "SeisanYoteiHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SeisanYoteiHistory",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "key"
        }
      ]
    },
    {
      "model": "SeisanYoteiHistory",
      "type": "normal",
      "isDefinedOnField": false,
      "dbName": "newCarId_key_unique",
      "fields": [
        {
          "name": "newCarId"
        },
        {
          "name": "key"
        }
      ]
    },
    {
      "model": "UserProgressAggregationTable",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UserProgressAggregationTable",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "UserProgressAggregationTable",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "UserProgressAggregationTable",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "date_userId_timing_label_unique",
      "fields": [
        {
          "name": "date"
        },
        {
          "name": "userId"
        },
        {
          "name": "timing"
        },
        {
          "name": "label"
        }
      ]
    },
    {
      "model": "ProgressAggregationTable",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ProgressAggregationTable",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "ProgressAggregationTable",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "date_storeId_unique",
      "fields": [
        {
          "name": "date"
        },
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "ProgressAggregationTableRecord",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ProgressAggregationTableRecord",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "progressAggregationTableId_timing_label_unique",
      "fields": [
        {
          "name": "progressAggregationTableId"
        },
        {
          "name": "timing"
        },
        {
          "name": "label"
        }
      ]
    },
    {
      "model": "FuriateStatusOnApprovement",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "FuriateStatusOnApprovement",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "newCarId"
        }
      ]
    },
    {
      "model": "CarTransferHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CarTransferHistory",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "newCarId"
        }
      ]
    },
    {
      "model": "TenpoTsuikoShinseiHeader",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TenpoTsuikoShinseiHeader",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "newCarId"
        }
      ]
    },
    {
      "model": "TenpoTsuikoShinseiDetail",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TenpoTsuikoShinseiDetail",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "TenpoTsuikoShinseiDetail",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "tenpoTsuikoShinseiHeaderId"
        }
      ]
    },
    {
      "model": "TenpoTsuikoData",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TenpoTsuikoData",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "APPINDEX"
        }
      ]
    },
    {
      "model": "TenpoTsuikoData",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "APPINDEX_FKEY"
        }
      ]
    },
    {
      "model": "TenpoTsuikoData",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "CD_TUIKO"
        }
      ]
    },
    {
      "model": "TenpoTsuikoData",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "processed"
        }
      ]
    },
    {
      "model": "Store",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Store",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "Store",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "Store",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "areaId"
        }
      ]
    },
    {
      "model": "User",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "email"
        }
      ]
    },
    {
      "model": "User",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaStoreId"
        }
      ]
    },
    {
      "model": "User",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "damageNameMasterId"
        }
      ]
    },
    {
      "model": "User",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "GoogleAccessToken",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "GoogleAccessToken",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "email"
        }
      ]
    },
    {
      "model": "RoleMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RoleMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "UserRole",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UserRole",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "roleMasterId"
        }
      ]
    },
    {
      "model": "UserRole",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "userId_roleMasterId_unique",
      "fields": [
        {
          "name": "userId"
        },
        {
          "name": "roleMasterId"
        }
      ]
    },
    {
      "model": "Calendar",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Calendar",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "ChainMethodLock",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RentaStore",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RentaStore",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "RentaStore",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "RentaDeal",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RentaDeal",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "contractNum"
        }
      ]
    },
    {
      "model": "RentaDeal",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaCustomerId"
        }
      ]
    },
    {
      "model": "RentaDeal",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "RentaDailyReport",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RentaDailyReport",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaCustomerId"
        }
      ]
    },
    {
      "model": "RentaDailyReport",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaStoreId"
        }
      ]
    },
    {
      "model": "RentaDailyReport",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "RentaCustomer",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RentaCustomer",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "RentaCustomer",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaStoreId"
        }
      ]
    },
    {
      "model": "RentaCustomer",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "RentaReference",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RentaReference",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "refFromId"
        }
      ]
    },
    {
      "model": "RentaReference",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "refToId"
        }
      ]
    },
    {
      "model": "RentaReference",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_rentaCustomerId_refFromId_refToId",
      "fields": [
        {
          "name": "rentaCustomerId"
        },
        {
          "name": "refFromId"
        },
        {
          "name": "refToId"
        }
      ]
    },
    {
      "model": "RefFrom",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RefFrom",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaCustomerId"
        }
      ]
    },
    {
      "model": "RefTo",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RefTo",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaCustomerId"
        }
      ]
    },
    {
      "model": "Purpose",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Purpose",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "purposeMasterId"
        }
      ]
    },
    {
      "model": "Purpose",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaDailyReportId"
        }
      ]
    },
    {
      "model": "Purpose",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "PurposeMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "PurposeMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "PurposeMaster",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "Outcome",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Outcome",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "outcomeMasterId"
        }
      ]
    },
    {
      "model": "Outcome",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaDailyReportId"
        }
      ]
    },
    {
      "model": "Outcome",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "OutcomeMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "OutcomeMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "OutcomeMaster",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "AlternateInfo",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "AlternateInfo",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaCustomerId"
        }
      ]
    },
    {
      "model": "AlternateInfo",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaDailyReportId"
        }
      ]
    },
    {
      "model": "InsuranceInfo",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "InsuranceInfo",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaDailyReportId"
        }
      ]
    },
    {
      "model": "InsuranceInfo",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaCustomerId"
        }
      ]
    },
    {
      "model": "ExtraInfo",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ExtraInfo",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaCustomerId"
        }
      ]
    },
    {
      "model": "ExtraInfo",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "rentaDailyReportId"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "sateiID"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "bankBranchMasterId"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "bankMasterId"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "newCarId"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "number98"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sateiID"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "destinationStoreId"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "tmpRentalStoreId"
        }
      ]
    },
    {
      "model": "Ucar",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "number98"
        },
        {
          "name": "NO_SYARYOU"
        },
        {
          "name": "DD_SIIRE"
        }
      ]
    },
    {
      "model": "Number98",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Number98",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "number"
        }
      ]
    },
    {
      "model": "UcarGarageLocationMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UcarGarageLocationMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "UcarGarageSlotMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UcarGarageSlotMaster",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "ucarGarageLocationMasterId"
        }
      ]
    },
    {
      "model": "UcarGarageSlotMaster",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_garageNumber_ucarGarageLocationMasterId",
      "fields": [
        {
          "name": "garageNumber"
        },
        {
          "name": "ucarGarageLocationMasterId"
        }
      ]
    },
    {
      "model": "AppliedUcarGarageSlot",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "AppliedUcarGarageSlot",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "ucarId"
        }
      ]
    },
    {
      "model": "AppliedUcarGarageSlot",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "ucarGarageSlotMasterId"
        }
      ]
    },
    {
      "model": "AppliedUcarGarageSlot",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_ucarId_ucarGarageSlotMasterId",
      "fields": [
        {
          "name": "ucarId"
        },
        {
          "name": "ucarGarageSlotMasterId"
        }
      ]
    },
    {
      "model": "BankMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "BankMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "BankBranchMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "BankBranchMaster",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "bankMasterId"
        }
      ]
    },
    {
      "model": "BankBranchMaster",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_code_bankMasterId",
      "fields": [
        {
          "name": "code"
        },
        {
          "name": "bankMasterId"
        }
      ]
    },
    {
      "model": "UcarProcess",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UcarProcess",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "UcarProcess",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "UcarProcess",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sateiID"
        }
      ]
    },
    {
      "model": "UcarProcess",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_sateiID_date_processCode",
      "fields": [
        {
          "name": "sateiID"
        },
        {
          "name": "date"
        },
        {
          "name": "processCode"
        }
      ]
    },
    {
      "model": "UcarPaperWorkNotes",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UcarPaperWorkNotes",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "UcarPaperWorkNotes",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "ucarId"
        }
      ]
    }
  ]
};
