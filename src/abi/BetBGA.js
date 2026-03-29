export const BetBGAABI = [
  // State variables
  "function ORACLE_FEE_BPS() view returns (uint256)",
  "function MAX_BET_AMOUNT() view returns (uint64)",
  "function nextBetId() view returns (uint32)",
  "function oracles(uint256) view returns (address)",
  "function owner() view returns (address)",
  "function acceptingNewBets() view returns (bool)",

  // Participant actions
  "function create(uint64 bgaTableId, uint64 amount, uint8 slotCount, uint64 predictedWinner) payable returns (uint32)",
  "function join(uint32 betId, uint64 predictedWinner) payable",
  "function confirm(uint32 betId)",
  "function leave(uint32 betId)",
  "function voteCancel(uint32 betId)",
  "function refund(uint32 betId)",

  // Oracle actions
  "function reportResult(uint32 betId, uint64[] winnerIds)",

  // Owner actions
  "function setAcceptingNewBets(bool accepting)",

  // View functions
  "function getParticipants(uint32 betId) view returns (tuple(address addr, uint64 predictedWinner, bool confirmed, bool cancelVote)[])",
  "function getOracleResultHash(uint32 betId, address oracle) view returns (bytes32)",
  "function getResultVotes(uint32 betId, bytes32 resultHash) view returns (uint8)",
  "function getResolvedWinnerIds(uint32 betId) view returns (uint64[])",
  "function getBetSummary(uint32 betId) view returns (tuple(uint32 betId, uint64 bgaTableId, uint8 slotCount, uint8 confirmCount, uint8 cancelVoteCount, uint8 state, uint64 amount, uint32 lockedAt, uint32 createdAtBlock, tuple(address addr, uint64 predictedWinner, bool confirmed, bool cancelVote)[] participants, uint64[] resolvedWinnerIds))",
  "function getBetsByState(uint8 state, uint32 cursor, uint8 limit, bool asc) view returns (tuple(uint32 betId, uint64 bgaTableId, uint8 slotCount, uint8 confirmCount, uint8 cancelVoteCount, uint8 state, uint64 amount, uint32 lockedAt, uint32 createdAtBlock, tuple(address addr, uint64 predictedWinner, bool confirmed, bool cancelVote)[] participants, uint64[] resolvedWinnerIds)[])",

  // Events
  "event BetCreated(uint32 indexed betId, uint64 indexed bgaTableId, uint32 timestamp, address indexed triggeredBy, uint64 amount, uint8 slotCount, uint64 predictedWinner)",
  "event BetJoined(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy, uint64 predictedWinner)",
  "event BetConfirming(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event BetLeft(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event BetReopened(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event BetConfirmed(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event BetLocked(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event BetResolved(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy, uint64[] winners)",
  "event BetNoConsensus(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event BetCancelVoted(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event BetCancelled(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event BetRefunded(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy)",
  "event OracleReported(uint32 indexed betId, uint32 timestamp, address indexed triggeredBy, bytes32 resultHash, uint64[] winnerIds)",
  "event AcceptingNewBetsChanged(bool accepting)",

  // Custom errors
  "error IncorrectValue()",
  "error TransferFailed()",
  "error InvalidOracleAddress(uint8 index)",
  "error DuplicateOracleAddress()",
  "error NotOracle()",
  "error NotParticipant()",
  "error SlotCountTooLow()",
  "error SlotCountTooHigh()",
  "error BetAmountTooLow()",
  "error BetAmountTooHigh()",
  "error InvalidTableId()",
  "error BetNotOpen()",
  "error BetFull()",
  "error InvalidPlayerId()",
  "error AlreadyParticipant()",
  "error BetNotConfirming()",
  "error AlreadyConfirmed()",
  "error CannotLeaveBet()",
  "error BetNotLocked()",
  "error AlreadyVotedCancel()",
  "error AlreadyReported()",
  "error RefundTooEarly()",
  "error LimitMustBePositive()",
  "error NotOwner()",
  "error NewBetsDisabled()",
];
