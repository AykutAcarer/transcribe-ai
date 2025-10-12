import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DEFAULT_CLIENT_OPTIONS,
  DEFAULT_TRANSCRIPTION_OPTIONS,
  DEFAULT_ASSEMBLYAI_CONFIG,
  FEATURE_OPTION_TO_FLAG,
  deriveFeatureSelectionsFromOptions,
  normalizeAssemblyConfig,
  parseCustomSpellingInput,
  parseRedactionPolicies,
  parseWordBoostInput
} from '@/lib/assemblyai';

const SUMMARY_TYPES = ['bullets', 'bullets_verbose', 'gist', 'headline', 'paragraph', 'qa'];
const SUMMARY_MODELS = ['informative', 'conversational', 'bullet_point'];
const BOOST_PARAMS = ['default', 'low', 'medium', 'high'];
const REDACT_AUDIO_QUALITY = ['low', 'medium', 'high'];
const SUBTITLE_FORMAT_OPTIONS = ['srt', 'vtt', 'txt'];

const SECTION_CLASSES = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
const FIELD_CARD_CLASSES = 'border border-white/10 rounded-lg p-4 glass-effect-sm space-y-2';
const FIELD_LABEL_CLASSES = 'text-sm font-medium text-white flex items-center gap-2';
const FIELD_HELPER_CLASSES = 'text-xs text-gray-400 leading-snug';

function toFeatureKey(optionKey) {
  return FEATURE_OPTION_TO_FLAG[optionKey] ?? null;
}

function mapSubtitleString(subtitles = []) {
  return subtitles
    .map((item) => item?.toLowerCase?.() ?? '')
    .filter((item) => SUBTITLE_FORMAT_OPTIONS.includes(item));
}

const AssemblyAIOptions = ({ value = DEFAULT_ASSEMBLYAI_CONFIG, onChange }) => {
  const { transcriptionOptions, clientOptions, featureSelections } = normalizeAssemblyConfig(value);

  const applyChanges = (nextTranscriptionOptions, nextClientOptions, nextFeatureSelections) => {
    onChange?.({
      transcriptionOptions: nextTranscriptionOptions,
      clientOptions: nextClientOptions,
      featureSelections: nextFeatureSelections
    });
  };

  const handleToggle = (optionKey) => (checked) => {
    const nextTranscription = { ...transcriptionOptions, [optionKey]: checked };
    const nextFeatures = { ...featureSelections };
    const featureKey = toFeatureKey(optionKey);

    if (featureKey) {
      nextFeatures[featureKey] = checked;
    }

    applyChanges(nextTranscription, clientOptions, nextFeatures);
  };

  const handleInputChange = (optionKey) => (eventOrValue) => {
    const value = eventOrValue?.target?.value ?? eventOrValue;
    const nextTranscription = { ...transcriptionOptions, [optionKey]: value };
    const nextFeatures = { ...featureSelections };
    const featureKey = toFeatureKey(optionKey);

    if (featureKey) {
      if (Array.isArray(value)) {
        nextFeatures[featureKey] = value.length > 0;
      } else {
        nextFeatures[featureKey] = Boolean(value && value !== '0');
      }
    }

    applyChanges(nextTranscription, clientOptions, nextFeatures);
  };

  const handleClientOption = (optionKey) => (event) => {
    const value = Number(event.target.value);
    const nextClient = {
      ...clientOptions,
      [optionKey]: Number.isNaN(value) ? DEFAULT_CLIENT_OPTIONS[optionKey] : value
    };
    applyChanges(transcriptionOptions, nextClient, featureSelections);
  };

  const handleSubtitleToggle = (format) => (checked) => {
    const current = new Set(mapSubtitleString(clientOptions.subtitleFormats));
    if (checked) current.add(format);
    else current.delete(format);
    const nextFormats = current.size ? Array.from(current) : ['srt'];
    const nextClient = { ...clientOptions, subtitleFormats: nextFormats };
    applyChanges(transcriptionOptions, nextClient, featureSelections);
  };

  const resetDefaults = () => {
    applyChanges(
      { ...DEFAULT_TRANSCRIPTION_OPTIONS },
      { ...DEFAULT_CLIENT_OPTIONS },
      deriveFeatureSelectionsFromOptions(DEFAULT_TRANSCRIPTION_OPTIONS)
    );
  };

  const wordBoostInput = transcriptionOptions.word_boost?.join(', ') ?? '';
  const customSpellingInput = (transcriptionOptions.custom_spelling || [])
    .map((item) => `${item.from?.join(', ') ?? ''} => ${item.to ?? ''}`)
    .join('\n');
  const redactionPoliciesInput = (transcriptionOptions.redact_pii_policies || []).join(', ');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">AssemblyAI Özellikleri</h2>
          <p className="text-sm text-gray-400">
            Tüm transkripsiyon ve zekâ özelliklerini etkinlestirip kisisellestirerek dosyalarinizi AssemblyAI ile analiz edin.
          </p>
        </div>
        <Button variant="outline" onClick={resetDefaults}>
          Varsayilanlari yükle
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['core', 'intelligence', 'safety', 'customization', 'client']}>
        <AccordionItem value="core">
          <AccordionTrigger>Temel transkripsiyon ayarlari</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="punctuate" checked={Boolean(transcriptionOptions.punctuate)} onCheckedChange={handleToggle('punctuate')} />
                  <Label htmlFor="punctuate" className={FIELD_LABEL_CLASSES}>Otomatik noktalama</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Konusmadaki cümleleri noktalama isaretleriyle düzenler.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="format-text" checked={Boolean(transcriptionOptions.format_text)} onCheckedChange={handleToggle('format_text')} />
                  <Label htmlFor="format-text" className={FIELD_LABEL_CLASSES}>Metni formatla</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Transkripti büyük harf ve paragraf kurallarina göre düzenler.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="language-detection" checked={Boolean(transcriptionOptions.language_detection)} onCheckedChange={handleToggle('language_detection')} />
                  <Label htmlFor="language-detection" className={FIELD_LABEL_CLASSES}>Otomatik dil algilama</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Ses dosyasinin dilini otomatik olarak algilar. Özel bir dil kodu vermek isterseniz asagidaki alani kullanin.</p>
                <div className="space-y-2">
                  <Label htmlFor="language-code" className="text-xs text-gray-300">Dil kodu (ör. tr, en, de)</Label>
                  <Input
                    id="language-code"
                    placeholder="ISO-639-1 kodu"
                    value={transcriptionOptions.language_code ?? ''}
                    onChange={handleInputChange('language_code')}
                  />
                </div>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="speaker-labels" checked={Boolean(transcriptionOptions.speaker_labels)} onCheckedChange={handleToggle('speaker_labels')} />
                  <Label htmlFor="speaker-labels" className={FIELD_LABEL_CLASSES}>Konusmaci etiketleri</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Konusmadaki farkli kisileri ayirt eder ve segmentlere konusmaci etiketi ekler.</p>
                <div className="space-y-2">
                  <Label htmlFor="speakers-expected" className="text-xs text-gray-300">Beklenen konusmaci sayisi (opsiyonel)</Label>
                  <Input
                    id="speakers-expected"
                    type="number"
                    min="0"
                    placeholder="Örn. 2"
                    value={transcriptionOptions.speakers_expected ?? ''}
                    onChange={handleInputChange('speakers_expected')}
                  />
                </div>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="dual-channel" checked={Boolean(transcriptionOptions.dual_channel)} onCheckedChange={handleToggle('dual_channel')} />
                  <Label htmlFor="dual-channel" className={FIELD_LABEL_CLASSES}>Çift kanal destegi</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Stereo kanallarda her konusmaciyi ayri kanaldan isleyerek dogrulugu artirir.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disfluencies" checked={Boolean(transcriptionOptions.disfluencies)} onCheckedChange={handleToggle('disfluencies')} />
                  <Label htmlFor="disfluencies" className={FIELD_LABEL_CLASSES}>Dolgu kelimelerini dahil et</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Eee, ii gibi duraksamalari metne ekler.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-profanity" checked={Boolean(transcriptionOptions.filter_profanity)} onCheckedChange={handleToggle('filter_profanity')} />
                  <Label htmlFor="filter-profanity" className={FIELD_LABEL_CLASSES}>Küfür filtreleme</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Uygunsuz kelimeleri yildiz (*) ile degistirir.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="intelligence">
          <AccordionTrigger>Zekâ ve içerik analizi</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-highlights" checked={Boolean(transcriptionOptions.auto_highlights)} onCheckedChange={handleToggle('auto_highlights')} />
                  <Label htmlFor="auto-highlights" className={FIELD_LABEL_CLASSES}>Anahtar ifadeler</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Konusmadan en önemli anahtar ifadeleri çikarir.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sentiment-analysis" checked={Boolean(transcriptionOptions.sentiment_analysis)} onCheckedChange={handleToggle('sentiment_analysis')} />
                  <Label htmlFor="sentiment-analysis" className={FIELD_LABEL_CLASSES}>Duygu analizi</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Her cümle için pozitif, negatif veya nötr duygu analizi üretir.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="entity-detection" checked={Boolean(transcriptionOptions.entity_detection)} onCheckedChange={handleToggle('entity_detection')} />
                  <Label htmlFor="entity-detection" className={FIELD_LABEL_CLASSES}>Varlik tanima</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Kisi, yer, marka gibi özel adlari isler.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-chapters" checked={Boolean(transcriptionOptions.auto_chapters)} onCheckedChange={handleToggle('auto_chapters')} />
                  <Label htmlFor="auto-chapters" className={FIELD_LABEL_CLASSES}>Otomatik bölümler</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Uzun konusmalari bölüm basliklari ile segmentlere ayirir.</p>
              </div>

              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="summarization" checked={Boolean(transcriptionOptions.summarization)} onCheckedChange={handleToggle('summarization')} />
                  <Label htmlFor="summarization" className={FIELD_LABEL_CLASSES}>AssemblyAI özet modeli</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Ses dosyasinin kisa ve okunabilir özetini hazirlar.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="summary-model" className="text-xs text-gray-300">Özet modeli</Label>
                    <select
                      id="summary-model"
                      className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={transcriptionOptions.summary_model ?? 'informative'}
                      onChange={handleInputChange('summary_model')}
                    >
                      {SUMMARY_MODELS.map((model) => (
                        <option key={model} value={model} className="bg-gray-900">
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary-type" className="text-xs text-gray-300">Özet tipi</Label>
                    <select
                      id="summary-type"
                      className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={transcriptionOptions.summary_type ?? 'bullets'}
                      onChange={handleInputChange('summary_type')}
                    >
                      {SUMMARY_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-gray-900">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="summary-auto-chapters"
                      checked={Boolean(transcriptionOptions.summary_auto_chapters)}
                      onCheckedChange={handleToggle('summary_auto_chapters')}
                    />
                    <Label htmlFor="summary-auto-chapters" className={FIELD_LABEL_CLASSES}>Bölümlere göre özetle</Label>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="safety">
          <AccordionTrigger>Içerik güvenligi ve PII</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="content-safety" checked={Boolean(transcriptionOptions.content_safety)} onCheckedChange={handleToggle('content_safety')} />
                  <Label htmlFor="content-safety" className={FIELD_LABEL_CLASSES}>Içerik güvenligi</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Güvenlik etiketleri ile potansiyel zararli içerikleri isaretler.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="iab-categories" checked={Boolean(transcriptionOptions.iab_categories)} onCheckedChange={handleToggle('iab_categories')} />
                  <Label htmlFor="iab-categories" className={FIELD_LABEL_CLASSES}>IAB konu kategorileri</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>IAB 2.0 taksonomisine göre konu basliklari üretir.</p>
              </div>

              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="redact-pii" checked={Boolean(transcriptionOptions.redact_pii)} onCheckedChange={handleToggle('redact_pii')} />
                  <Label htmlFor="redact-pii" className={FIELD_LABEL_CLASSES}>PII metin redaksiyonu</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Kimlik bilgilerini transkript metninden maskeler. Politikalari virgül ile ayirabilirsiniz (ör. person_name, email).</p>
                <Input
                  placeholder="person_name, email, phone_number"
                  value={redactionPoliciesInput}
                  onChange={(event) => handleInputChange('redact_pii_policies')(parseRedactionPolicies(event.target.value))}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="redact-pii-sub"
                    checked={Boolean(transcriptionOptions.redact_pii_sub)}
                    onCheckedChange={handleToggle('redact_pii_sub')}
                  />
                  <Label htmlFor="redact-pii-sub" className={FIELD_LABEL_CLASSES}>Altyazilarda PII maskele</Label>
                </div>
              </div>

              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="redact-pii-audio" checked={Boolean(transcriptionOptions.redact_pii_audio)} onCheckedChange={handleToggle('redact_pii_audio')} />
                  <Label htmlFor="redact-pii-audio" className={FIELD_LABEL_CLASSES}>Ses redaksiyonu</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>PII geçen kisimlarda sesi maskeleyen ek bir ses dosyasi üretir.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="redact-pii-audio-quality" className="text-xs text-gray-300">Ses kalitesi</Label>
                    <select
                      id="redact-pii-audio-quality"
                      className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={transcriptionOptions.redact_pii_audio_quality ?? 'medium'}
                      onChange={handleInputChange('redact_pii_audio_quality')}
                    >
                      {REDACT_AUDIO_QUALITY.map((quality) => (
                        <option key={quality} value={quality} className="bg-gray-900">
                          {quality}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="customization">
          <AccordionTrigger>Özellestirme</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <Label className={FIELD_LABEL_CLASSES}>Kelime güçlendirme (Word Boost)</Label>
                <p className={FIELD_HELPER_CLASSES}>Sik kullanilan özel kelimeleri tanimlayarak tanima dogrulugunu artirir. Virgülle ayirin.</p>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="assemblyai, istanbul, fintech"
                  value={wordBoostInput}
                  onChange={(event) => handleInputChange('word_boost')(parseWordBoostInput(event.target.value))}
                />
                <div className="space-y-2">
                  <Label htmlFor="boost-param" className="text-xs text-gray-300">Boost parametresi</Label>
                  <select
                    id="boost-param"
                    className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={transcriptionOptions.boost_param ?? 'default'}
                    onChange={handleInputChange('boost_param')}
                  >
                    {BOOST_PARAMS.map((level) => (
                      <option key={level} value={level} className="bg-gray-900">
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <Label className={FIELD_LABEL_CLASSES}>Özel yazim eslestirmeleri</Label>
                <p className={FIELD_HELPER_CLASSES}>Her satir için "yanlis yazim, alternatif => dogru yazim" formatini kullanin.</p>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="istanbul => Istanbul\nassemly ai, assembly ai => AssemblyAI"
                  value={customSpellingInput}
                  onChange={(event) => handleInputChange('custom_spelling')(parseCustomSpellingInput(event.target.value))}
                />
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="audio-start" className={FIELD_LABEL_CLASSES}>Ses baslangiç süresi (ms)</Label>
                <Input
                  id="audio-start"
                  type="number"
                  placeholder="Örn. 0"
                  value={transcriptionOptions.audio_start_from ?? ''}
                  onChange={handleInputChange('audio_start_from')}
                />
                <p className={FIELD_HELPER_CLASSES}>Belirtilen milisaniyeden itibaren transkripsiyon baslatilir.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="audio-end" className={FIELD_LABEL_CLASSES}>Ses bitis süresi (ms)</Label>
                <Input
                  id="audio-end"
                  type="number"
                  placeholder="Örn. 120000"
                  value={transcriptionOptions.audio_end_at ?? ''}
                  onChange={handleInputChange('audio_end_at')}
                />
                <p className={FIELD_HELPER_CLASSES}>Belirtilen milisaniyede transkripsiyon sonlandirilir.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="speech-threshold" className={FIELD_LABEL_CLASSES}>Konusma esigi</Label>
                <Input
                  id="speech-threshold"
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  value={transcriptionOptions.speech_threshold ?? ''}
                  onChange={handleInputChange('speech_threshold')}
                />
                <p className={FIELD_HELPER_CLASSES}>Ses seviyesine göre konusma algilama hassasiyetini ayarlar.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="client">
          <AccordionTrigger>Istemci tarafi ayarlari</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="polling-interval" className={FIELD_LABEL_CLASSES}>Sorgulama araligi (ms)</Label>
                <Input
                  id="polling-interval"
                  type="number"
                  min="1000"
                  step="500"
                  value={clientOptions.pollingInterval}
                  onChange={handleClientOption('pollingInterval')}
                />
                <p className={FIELD_HELPER_CLASSES}>Transkripsiyon tamamlanana kadar AssemblyAI API'sinin kaç milisaniyede bir yoklanacagini belirler.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="polling-timeout" className={FIELD_LABEL_CLASSES}>Zaman asimi (ms)</Label>
                <Input
                  id="polling-timeout"
                  type="number"
                  step="1000"
                  value={clientOptions.pollingTimeout}
                  onChange={handleClientOption('pollingTimeout')}
                />
                <p className={FIELD_HELPER_CLASSES}>Varsayilan -1 sinirsiz bekler. Pozitif deger girildiginde belirtilen süre sonunda islem iptal edilir.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label className={FIELD_LABEL_CLASSES}>Altyazi formatlari</Label>
                <p className={FIELD_HELPER_CLASSES}>Otomatik üretilmis altyazilari hangi formatlarda saklayacaginizi seçin.</p>
                <div className="space-y-2">
                  {SUBTITLE_FORMAT_OPTIONS.map((format) => {
                    const id = `subtitle-${format}`;
                    return (
                      <div className="flex items-center space-x-2" key={format}>
                        <Checkbox
                          id={id}
                          checked={clientOptions.subtitleFormats.includes(format)}
                          onCheckedChange={handleSubtitleToggle(format)}
                        />
                        <Label htmlFor={id} className="text-sm text-gray-200 uppercase">{format}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="subtitle-chars" className={FIELD_LABEL_CLASSES}>Altyazi karakter siniri</Label>
                <Input
                  id="subtitle-chars"
                  type="number"
                  min="16"
                  step="2"
                  value={clientOptions.subtitleCharsPerCaption}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    const nextClient = {
                      ...clientOptions,
                      subtitleCharsPerCaption: Number.isNaN(value) ? DEFAULT_CLIENT_OPTIONS.subtitleCharsPerCaption : value
                    };
                    applyChanges(transcriptionOptions, nextClient, featureSelections);
                  }}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AssemblyAIOptions;
