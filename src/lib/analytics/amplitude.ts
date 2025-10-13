import * as amplitude from '@amplitude/analytics-browser';
import * as sessionReplay from '@amplitude/plugin-session-replay-browser';

const AMPLITUDE_API_KEY = '97ca36cc0d37fe328333ce6f930a71e3';

let isInitialized = false;

/**
 * Initialize Amplitude with autocapture and session replay
 * Should be called once when the app loads
 */
export function initializeAmplitude() {
  if (isInitialized) return;

  try {
    // Add session replay plugin
    amplitude.add(sessionReplay.plugin({ sampleRate: 1 }));

    // Initialize Amplitude with autocapture
    amplitude.init(AMPLITUDE_API_KEY, {
      defaultTracking: {
        pageViews: true,
        sessions: true,
        formInteractions: true,
      },
      autocapture: {
        elementInteractions: true,
      },
    });

    isInitialized = true;
    console.log('Amplitude initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Amplitude:', error);
  }
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, eventProperties?: Record<string, any>) {
  try {
    amplitude.track(eventName, eventProperties);
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  try {
    const identifyEvent = new amplitude.Identify();
    Object.entries(properties).forEach(([key, value]) => {
      identifyEvent.set(key, value);
    });
    amplitude.identify(identifyEvent);
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
}

/**
 * Set user ID
 */
export function setUserId(userId: string | undefined) {
  try {
    amplitude.setUserId(userId);
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
}

/**
 * Track page view (auto-tracked by default, but can be called manually)
 */
export function trackPageView(pageName?: string, properties?: Record<string, any>) {
  try {
    amplitude.track('Page View', {
      page_name: pageName,
      ...properties,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

// ============================================================================
// GAME-SPECIFIC TRACKING
// ============================================================================

/**
 * Track when a game/quiz is started
 */
export function trackGameStart(gameId: string, gameName: string, properties?: Record<string, any>) {
  trackEvent('Game Started', {
    game_id: gameId,
    game_name: gameName,
    ...properties,
  });
}

/**
 * Track when a game/quiz is completed
 */
export function trackGameComplete(gameId: string, gameName: string, properties?: Record<string, any>) {
  trackEvent('Game Completed', {
    game_id: gameId,
    game_name: gameName,
    ...properties,
  });
}

/**
 * Track progress through a game (slide/step completion)
 */
export function trackGameProgress(
  gameId: string,
  gameName: string,
  step: number,
  totalSteps: number,
  properties?: Record<string, any>
) {
  const progressPercentage = Math.round((step / totalSteps) * 100);

  trackEvent('Game Progress', {
    game_id: gameId,
    game_name: gameName,
    current_step: step,
    total_steps: totalSteps,
    progress_percentage: progressPercentage,
    ...properties,
  });
}

/**
 * Track when a user drops off from a game
 */
export function trackGameDropOff(
  gameId: string,
  gameName: string,
  step: number,
  totalSteps: number,
  properties?: Record<string, any>
) {
  trackEvent('Game Drop Off', {
    game_id: gameId,
    game_name: gameName,
    drop_off_step: step,
    total_steps: totalSteps,
    completion_percentage: Math.round((step / totalSteps) * 100),
    ...properties,
  });
}

/**
 * Track a specific interaction within a game
 */
export function trackGameInteraction(
  gameId: string,
  gameName: string,
  interactionType: string,
  properties?: Record<string, any>
) {
  trackEvent('Game Interaction', {
    game_id: gameId,
    game_name: gameName,
    interaction_type: interactionType,
    ...properties,
  });
}

/**
 * Track when a user views their game results
 */
export function trackGameResults(
  gameId: string,
  gameName: string,
  resultType?: string,
  properties?: Record<string, any>
) {
  trackEvent('Game Results Viewed', {
    game_id: gameId,
    game_name: gameName,
    result_type: resultType,
    ...properties,
  });
}

// ============================================================================
// HUMANITY GAME-SPECIFIC TRACKING
// ============================================================================

/**
 * Track when a user starts the Humanity game
 */
export function trackHumanityStart(sessionId: string) {
  trackGameStart('humanity', 'Humanity Test', { session_id: sessionId });
}

/**
 * Track when a user completes a step in the Humanity game
 */
export function trackHumanityStepComplete(
  sessionId: string,
  stepNumber: number,
  totalSteps: number,
  mechanic: string,
  timeSpent: number,
  properties?: Record<string, any>
) {
  trackGameProgress('humanity', 'Humanity Test', stepNumber, totalSteps, {
    session_id: sessionId,
    step_mechanic: mechanic,
    time_spent_ms: timeSpent,
    ...properties,
  });
}

/**
 * Track when a user completes the Humanity game and gets results
 */
export function trackHumanityComplete(
  sessionId: string,
  totalSteps: number,
  totalTime: number,
  properties?: Record<string, any>
) {
  trackGameComplete('humanity', 'Humanity Test', {
    session_id: sessionId,
    total_steps: totalSteps,
    total_time_ms: totalTime,
    ...properties,
  });
}

/**
 * Track when a user views their Humanity results
 */
export function trackHumanityResultsView(
  sessionId: string,
  resultTab: string,
  properties?: Record<string, any>
) {
  trackGameResults('humanity', 'Humanity Test', resultTab, {
    session_id: sessionId,
    ...properties,
  });
}

/**
 * Track when a user drops off from the Humanity game
 */
export function trackHumanityDropOff(
  sessionId: string,
  stepNumber: number,
  totalSteps: number,
  timeSpent: number
) {
  trackGameDropOff('humanity', 'Humanity Test', stepNumber, totalSteps, {
    session_id: sessionId,
    time_spent_ms: timeSpent,
  });
}

// ============================================================================
// QUIZ-SPECIFIC TRACKING
// ============================================================================

/**
 * Track when a user starts a quiz
 */
export function trackQuizStart(quizId: string, quizName: string, properties?: Record<string, any>) {
  trackGameStart(quizId, quizName, properties);
}

/**
 * Track when a user answers a quiz question
 */
export function trackQuizAnswer(
  quizId: string,
  quizName: string,
  questionNumber: number,
  totalQuestions: number,
  properties?: Record<string, any>
) {
  trackGameProgress(quizId, quizName, questionNumber, totalQuestions, properties);
}

/**
 * Track when a user completes a quiz
 */
export function trackQuizComplete(
  quizId: string,
  quizName: string,
  resultArchetype?: string,
  properties?: Record<string, any>
) {
  trackGameComplete(quizId, quizName, {
    result_archetype: resultArchetype,
    ...properties,
  });
}

/**
 * Track when a user shares their quiz results
 */
export function trackQuizShare(quizId: string, quizName: string, shareMethod: string) {
  trackEvent('Quiz Result Shared', {
    game_id: quizId,
    game_name: quizName,
    share_method: shareMethod,
  });
}

// ============================================================================
// GENERAL USER ACTIONS
// ============================================================================

/**
 * Track button clicks
 */
export function trackButtonClick(buttonName: string, location: string, properties?: Record<string, any>) {
  trackEvent('Button Clicked', {
    button_name: buttonName,
    location,
    ...properties,
  });
}

/**
 * Track navigation events
 */
export function trackNavigation(from: string, to: string, properties?: Record<string, any>) {
  trackEvent('Navigation', {
    from_page: from,
    to_page: to,
    ...properties,
  });
}

/**
 * Track when a user signs up
 */
export function trackSignUp(method: string, properties?: Record<string, any>) {
  trackEvent('Sign Up', {
    sign_up_method: method,
    ...properties,
  });
}

/**
 * Track when a user logs in
 */
export function trackLogin(method: string, properties?: Record<string, any>) {
  trackEvent('Login', {
    login_method: method,
    ...properties,
  });
}

/**
 * Track errors
 */
export function trackError(errorType: string, errorMessage: string, properties?: Record<string, any>) {
  trackEvent('Error Occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...properties,
  });
}

export default {
  initialize: initializeAmplitude,
  trackEvent,
  setUserProperties,
  setUserId,
  trackPageView,
  trackGameStart,
  trackGameComplete,
  trackGameProgress,
  trackGameDropOff,
  trackGameInteraction,
  trackGameResults,
  trackHumanityStart,
  trackHumanityStepComplete,
  trackHumanityComplete,
  trackHumanityResultsView,
  trackHumanityDropOff,
  trackQuizStart,
  trackQuizAnswer,
  trackQuizComplete,
  trackQuizShare,
  trackButtonClick,
  trackNavigation,
  trackSignUp,
  trackLogin,
  trackError,
};

