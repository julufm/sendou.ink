import { z } from "zod";
import { PLUS_DOWNVOTE, PLUS_UPVOTE } from "~/constants";
import type { PlusVoteFromFE } from "~/features/plus-voting/core";
import { assertType } from "~/utils/types";
import { safeJSONParse } from "~/utils/zod";

export const voteSchema = z.object({
	votedId: z.number(),
	score: z.number().refine((val) => [PLUS_DOWNVOTE, PLUS_UPVOTE].includes(val)),
});

assertType<z.infer<typeof voteSchema>, PlusVoteFromFE>();

export const votingActionSchema = z.object({
	votes: z.preprocess(safeJSONParse, z.array(voteSchema)),
});
