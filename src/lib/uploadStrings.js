const uploadStrings = {
  en: {
    metaTitle: 'Upload & Transcribe - TranscribeAI',
    description:
      'Upload a file or transcribe audio directly from a URL. Configure every AssemblyAI feature in one place.',
    title: 'AssemblyAI Control Center',
    dropTitle: 'Drop files here or click to browse',
    dropHint: 'Max 200MB & 5 min per file',
    selectButton: 'Select Files',
    selectedFilesLabel: 'Selected Files',
    status: {
      pending: 'Pending',
      processing: 'Transcribing...',
      completed: 'Completed',
      failed: 'Failed'
    },
    transcribeLabel: 'Transcribe',
    transcribeSuffix: 'file(s)',
    transcribingLabel: 'Transcribing...',
    toast: {
      successTitle: 'Transcription Complete!',
      successDescription: (count) =>
        `${count} file${count === 1 ? '' : 's'} have been successfully transcribed.`
    },
    errors: {
      uploadTitle: (file) => `Error with ${file?.name || 'file'}`,
      largeTitle: 'File too large',
      largeDescription: (file) => `"${file?.name}" is larger than the 200MB limit.`,
      formatTitle: 'Invalid file format',
      formatDescription: (file) => `File type "${file?.type || 'unknown'}" is not supported.`,
      durationTitle: 'File too long',
      durationDescription: (file) => `"${file?.name}" exceeds the 5-minute duration limit.`,
      generalTitle: 'Upload failed'
    },
    url: {
      heading: 'Remote media URL',
      hint: 'Provide an HTTPS-accessible audio or video link that points directly to the file.',
      requirementNote:
        'AssemblyAI requires publicly accessible direct-download audio/video URLs. See the documentation for details.',
      displayName: 'Display name (optional)',
      placeholder: 'Meeting recording - Oct 12',
      button: 'Transcribe URL',
      buttonLoading: 'Transcribing...',
      successTitle: 'Transcription ready',
      successDescription: 'The remote media file was processed successfully.',
      errorTitle: 'Transcription failed',
      missingTitle: 'URL required',
      missingDescription: 'Please provide an accessible audio or video URL.'
    }
  },
  tr: {
    metaTitle: 'Yükle ve Transkribe Et - TranscribeAI',
    description:
      'Dosya yükleyin veya bir medya URL’sini transkribe edin. AssemblyAI özelliklerini tek ekrandan yapılandırın.',
    title: 'AssemblyAI Kontrol Merkezi',
    dropTitle: 'Dosyaları buraya bırakın veya göz atın',
    dropHint: 'Maksimum 200MB ve 5 dakika',
    selectButton: 'Dosya seç',
    selectedFilesLabel: 'Seçilen dosyalar',
    status: {
      pending: 'Beklemede',
      processing: 'Transkribe ediliyor...',
      completed: 'Tamamlandı',
      failed: 'Başarısız'
    },
    transcribeLabel: 'Transkribe et',
    transcribeSuffix: 'dosya',
    transcribingLabel: 'Transkribe ediliyor...',
    toast: {
      successTitle: 'Transkripsiyon tamamlandı!',
      successDescription: (count) =>
        `${count} dosya başarıyla transkribe edildi.`
    },
    errors: {
      uploadTitle: (file) => `${file?.name || 'Dosya'} işlenemedi`,
      largeTitle: 'Dosya çok büyük',
      largeDescription: (file) => `"${file?.name}" 200MB sınırını aşıyor.`,
      formatTitle: 'Geçersiz dosya formatı',
      formatDescription: (file) => `“${file?.type || 'bilinmeyen'}” türü desteklenmiyor.`,
      durationTitle: 'Dosya çok uzun',
      durationDescription: (file) => `"${file?.name}" 5 dakikalık süre sınırını aşıyor.`,
      generalTitle: 'Yükleme başarısız'
    },
    url: {
      heading: 'Uzak medya URL’si',
      hint: 'Doğrudan dosyaya işaret eden HTTPS üzerinden erişilebilir ses veya video bağlantısı girin.',
      requirementNote:
        'AssemblyAI, herkes tarafından erişilebilen doğrudan indirme bağlantıları gerektirir. Ayrıntılar için dokümana bakın.',
      displayName: 'Görünür ad (opsiyonel)',
      placeholder: 'Toplantı kaydı - 12 Ekim',
      button: 'URL’yi transkribe et',
      buttonLoading: 'Transkribe ediliyor...',
      successTitle: 'Transkripsiyon hazır',
      successDescription: 'Uzak medya dosyası başarıyla işlendi.',
      errorTitle: 'Transkripsiyon başarısız',
      missingTitle: 'URL gerekli',
      missingDescription: 'Lütfen erişilebilir bir ses veya video URL’si girin.'
    }
  }
};

export const getUploadStrings = (language = 'en') =>
  uploadStrings[language] ?? uploadStrings.en;
