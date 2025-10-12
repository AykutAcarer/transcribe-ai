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
          <h2 className="text-xl font-semibold text-white">TranscribeAI Features</h2>
          <p className="text-sm text-gray-400">
            Enable and customize every transcription and intelligence feature to analyze your files.
          </p>
        </div>
        <Button variant="outline" onClick={resetDefaults}>
          Load defaults
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={[]}>
        <AccordionItem value="core">
          <AccordionTrigger>Core transcription settings</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="punctuate" checked={Boolean(transcriptionOptions.punctuate)} onCheckedChange={handleToggle('punctuate')} />
                  <Label htmlFor="punctuate" className={FIELD_LABEL_CLASSES}>Automatic punctuation</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Adds punctuation automatically to spoken sentences.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="format-text" checked={Boolean(transcriptionOptions.format_text)} onCheckedChange={handleToggle('format_text')} />
                  <Label htmlFor="format-text" className={FIELD_LABEL_CLASSES}>Format text</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Applies sentence casing and paragraph formatting to the transcript.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="language-detection" checked={Boolean(transcriptionOptions.language_detection)} onCheckedChange={handleToggle('language_detection')} />
                  <Label htmlFor="language-detection" className={FIELD_LABEL_CLASSES}>Automatic language detection</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Detects the language automatically. Provide a code below if you need to override it.</p>
                <div className="space-y-2">
                  <Label htmlFor="language-code" className="text-xs text-gray-300">Language code (e.g. en, de, es)</Label>
                  <Input
                    id="language-code"
                    placeholder="ISO-639-1 code"
                    value={transcriptionOptions.language_code ?? ''}
                    onChange={handleInputChange('language_code')}
                  />
                </div>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="speaker-labels" checked={Boolean(transcriptionOptions.speaker_labels)} onCheckedChange={handleToggle('speaker_labels')} />
                  <Label htmlFor="speaker-labels" className={FIELD_LABEL_CLASSES}>Speaker diarization</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Distinguishes speakers in the audio and tags each segment.</p>
                <div className="space-y-2">
                  <Label htmlFor="speakers-expected" className="text-xs text-gray-300">Expected speaker count (optional)</Label>
                  <Input
                    id="speakers-expected"
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    value={transcriptionOptions.speakers_expected ?? ''}
                    onChange={handleInputChange('speakers_expected')}
                  />
                </div>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="dual-channel" checked={Boolean(transcriptionOptions.dual_channel)} onCheckedChange={handleToggle('dual_channel')} />
                  <Label htmlFor="dual-channel" className={FIELD_LABEL_CLASSES}>Dual channel support</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Processes each speaker from separate stereo channels to improve accuracy.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disfluencies" checked={Boolean(transcriptionOptions.disfluencies)} onCheckedChange={handleToggle('disfluencies')} />
                  <Label htmlFor="disfluencies" className={FIELD_LABEL_CLASSES}>Include filler words</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Keeps filler words like "um" and "uh" in the transcript.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-profanity" checked={Boolean(transcriptionOptions.filter_profanity)} onCheckedChange={handleToggle('filter_profanity')} />
                  <Label htmlFor="filter-profanity" className={FIELD_LABEL_CLASSES}>Profanity filter</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Replaces offensive words with an asterisk (*).</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="intelligence">
          <AccordionTrigger>Intelligence & content analysis</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-highlights" checked={Boolean(transcriptionOptions.auto_highlights)} onCheckedChange={handleToggle('auto_highlights')} />
                  <Label htmlFor="auto-highlights" className={FIELD_LABEL_CLASSES}>Key phrases</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Extracts the most important phrases from the conversation.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sentiment-analysis" checked={Boolean(transcriptionOptions.sentiment_analysis)} onCheckedChange={handleToggle('sentiment_analysis')} />
                  <Label htmlFor="sentiment-analysis" className={FIELD_LABEL_CLASSES}>Sentiment analysis</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Labels each sentence with positive, neutral, or negative sentiment.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="entity-detection" checked={Boolean(transcriptionOptions.entity_detection)} onCheckedChange={handleToggle('entity_detection')} />
                  <Label htmlFor="entity-detection" className={FIELD_LABEL_CLASSES}>Entity detection</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Identifies named entities such as people, places, and brands.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-chapters" checked={Boolean(transcriptionOptions.auto_chapters)} onCheckedChange={handleToggle('auto_chapters')} />
                  <Label htmlFor="auto-chapters" className={FIELD_LABEL_CLASSES}>Auto chapters</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Splits long conversations into chapters with titles.</p>
              </div>

              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="summarization" checked={Boolean(transcriptionOptions.summarization)} onCheckedChange={handleToggle('summarization')} />
                  <Label htmlFor="summarization" className={FIELD_LABEL_CLASSES}>AssemblyAI summary model</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Creates a concise, readable summary of the audio.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="summary-model" className="text-xs text-gray-300">Summary model</Label>
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
                    <Label htmlFor="summary-type" className="text-xs text-gray-300">Summary type</Label>
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
                    <Label htmlFor="summary-auto-chapters" className={FIELD_LABEL_CLASSES}>Summarize by chapters</Label>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="safety">
          <AccordionTrigger>Content safety & PII</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="content-safety" checked={Boolean(transcriptionOptions.content_safety)} onCheckedChange={handleToggle('content_safety')} />
                  <Label htmlFor="content-safety" className={FIELD_LABEL_CLASSES}>Content safety</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Flags potentially harmful content with safety labels.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="iab-categories" checked={Boolean(transcriptionOptions.iab_categories)} onCheckedChange={handleToggle('iab_categories')} />
                  <Label htmlFor="iab-categories" className={FIELD_LABEL_CLASSES}>IAB topic categories</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Generates topical tags following the IAB 2.0 taxonomy.</p>
              </div>

              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="redact-pii" checked={Boolean(transcriptionOptions.redact_pii)} onCheckedChange={handleToggle('redact_pii')} />
                  <Label htmlFor="redact-pii" className={FIELD_LABEL_CLASSES}>PII text redaction</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Masks personally identifiable information in the transcript. Separate policies with commas (e.g. person_name, email).</p>
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
                  <Label htmlFor="redact-pii-sub" className={FIELD_LABEL_CLASSES}>Mask PII in subtitles</Label>
                </div>
              </div>

              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <div className="flex items-center space-x-2">
                  <Checkbox id="redact-pii-audio" checked={Boolean(transcriptionOptions.redact_pii_audio)} onCheckedChange={handleToggle('redact_pii_audio')} />
                  <Label htmlFor="redact-pii-audio" className={FIELD_LABEL_CLASSES}>Redacted audio</Label>
                </div>
                <p className={FIELD_HELPER_CLASSES}>Generates an alternate audio file with PII sections masked.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="redact-pii-audio-quality" className="text-xs text-gray-300">Audio quality</Label>
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
          <AccordionTrigger>Customization</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={`${FIELD_CARD_CLASSES} sm:col-span-2`}>
                <Label className={FIELD_LABEL_CLASSES}>Word boost</Label>
                <p className={FIELD_HELPER_CLASSES}>Improve recognition by listing important keywords. Separate entries with commas.</p>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="assemblyai, istanbul, fintech"
                  value={wordBoostInput}
                  onChange={(event) => handleInputChange('word_boost')(parseWordBoostInput(event.target.value))}
                />
                <div className="space-y-2">
                  <Label htmlFor="boost-param" className="text-xs text-gray-300">Boost parameter</Label>
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
                <Label className={FIELD_LABEL_CLASSES}>Custom spelling rules</Label>
                <p className={FIELD_HELPER_CLASSES}>Use the format "incorrect, alt => Correct" for each line.</p>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="istanbul => Istanbul\nassemly ai, assembly ai => AssemblyAI"
                  value={customSpellingInput}
                  onChange={(event) => handleInputChange('custom_spelling')(parseCustomSpellingInput(event.target.value))}
                />
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="audio-start" className={FIELD_LABEL_CLASSES}>Audio start time (ms)</Label>
                <Input
                  id="audio-start"
                  type="number"
                  placeholder="e.g. 0"
                  value={transcriptionOptions.audio_start_from ?? ''}
                  onChange={handleInputChange('audio_start_from')}
                />
                <p className={FIELD_HELPER_CLASSES}>Start the transcription from the specified millisecond.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="audio-end" className={FIELD_LABEL_CLASSES}>Audio end time (ms)</Label>
                <Input
                  id="audio-end"
                  type="number"
                  placeholder="e.g. 120000"
                  value={transcriptionOptions.audio_end_at ?? ''}
                  onChange={handleInputChange('audio_end_at')}
                />
                <p className={FIELD_HELPER_CLASSES}>Stop the transcription at the specified millisecond.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="speech-threshold" className={FIELD_LABEL_CLASSES}>Speech threshold</Label>
                <Input
                  id="speech-threshold"
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  value={transcriptionOptions.speech_threshold ?? ''}
                  onChange={handleInputChange('speech_threshold')}
                />
                <p className={FIELD_HELPER_CLASSES}>Adjusts speech detection sensitivity based on audio level.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="client">
          <AccordionTrigger>Istemci tarafi ayarlari</AccordionTrigger>
          <AccordionContent>
            <div className={SECTION_CLASSES}>
              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="polling-interval" className={FIELD_LABEL_CLASSES}>Polling interval (ms)</Label>
                <Input
                  id="polling-interval"
                  type="number"
                  min="1000"
                  step="500"
                  value={clientOptions.pollingInterval}
                  onChange={handleClientOption('pollingInterval')}
                />
                <p className={FIELD_HELPER_CLASSES}>Determines how frequently to poll the AssemblyAI API until completion.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label htmlFor="polling-timeout" className={FIELD_LABEL_CLASSES}>Timeout (ms)</Label>
                <Input
                  id="polling-timeout"
                  type="number"
                  step="1000"
                  value={clientOptions.pollingTimeout}
                  onChange={handleClientOption('pollingTimeout')}
                />
                <p className={FIELD_HELPER_CLASSES}>Default -1 waits indefinitely. A positive value cancels the job after that many milliseconds.</p>
              </div>

              <div className={FIELD_CARD_CLASSES}>
                <Label className={FIELD_LABEL_CLASSES}>Subtitle formats</Label>
                <p className={FIELD_HELPER_CLASSES}>Choose which subtitle formats to store for each transcript.</p>
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
                <Label htmlFor="subtitle-chars" className={FIELD_LABEL_CLASSES}>Subtitle character limit</Label>
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
