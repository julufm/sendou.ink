import type { MetaFunction, SerializeFrom } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { Combobox } from "~/components/Combobox";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { SendouSwitch } from "~/components/elements/Switch";
import { CrossIcon } from "~/components/icons/Cross";
import type { SendouRouteHandle } from "~/utils/remix.server";
import { artPage, navIconUrl } from "~/utils/urls";
import { metaTags } from "../../../utils/remix";
import { FILTERED_TAG_KEY_SEARCH_PARAM_KEY } from "../art-constants";
import { ArtGrid } from "../components/ArtGrid";

import { loader } from "../loaders/art.server";
export { loader };

const OPEN_COMMISIONS_KEY = "open";

export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
	const currentFilteredTag = args.currentUrl.searchParams.get(
		FILTERED_TAG_KEY_SEARCH_PARAM_KEY,
	);
	const nextFilteredTag = args.nextUrl.searchParams.get(
		FILTERED_TAG_KEY_SEARCH_PARAM_KEY,
	);

	if (currentFilteredTag === nextFilteredTag) return false;

	return args.defaultShouldRevalidate;
};

export const handle: SendouRouteHandle = {
	i18n: ["art"],
	breadcrumb: () => ({
		imgPath: navIconUrl("art"),
		href: artPage(),
		type: "IMAGE",
	}),
};

export const meta: MetaFunction = (args) => {
	const data = args.data as SerializeFrom<typeof loader> | null;

	if (!data) return [];

	return metaTags({
		title: "Art",
		ogTitle: "Splatoon art showcase",
		description:
			"Splatoon art filterable by various tags. Find artist to commission for your own custom art. Includes various styles such as traditional, digital, 3D and SFM.",
		location: args.location,
	});
};

export default function ArtPage() {
	const { t } = useTranslation(["art", "common"]);
	const data = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	const filteredTag = searchParams.get(FILTERED_TAG_KEY_SEARCH_PARAM_KEY);
	const showOpenCommissions = searchParams.get(OPEN_COMMISIONS_KEY) === "true";

	const arts = !showOpenCommissions
		? data.arts
		: data.arts.filter((art) => art.author?.commissionsOpen);

	return (
		<Main className="stack lg">
			<div className="stack horizontal md justify-between items-center flex-wrap">
				<div className="stack horizontal sm text-sm font-semi-bold">
					<SendouSwitch
						isSelected={showOpenCommissions}
						onChange={() =>
							setSearchParams((prev) => {
								prev.set(OPEN_COMMISIONS_KEY, String(!showOpenCommissions));
								return prev;
							})
						}
						id="open"
					/>
					<Label htmlFor="open" className="m-auto-0">
						{t("art:openCommissionsOnly")}
					</Label>
				</div>
				<Combobox
					key={filteredTag}
					options={data.allTags.map((t) => ({
						label: t.name,
						value: String(t.id),
					}))}
					inputName="tags"
					placeholder={t("art:filterByTag")}
					initialValue={null}
					onChange={(selection) => {
						if (!selection) return;

						setSearchParams((prev) => {
							prev.set(FILTERED_TAG_KEY_SEARCH_PARAM_KEY, selection.label);
							return prev;
						});
					}}
				/>
			</div>
			{filteredTag ? (
				<div className="text-xs text-lighter stack md horizontal items-center">
					{t("art:filteringByTag", { tag: filteredTag })}
					<Button
						size="tiny"
						variant="minimal-destructive"
						icon={<CrossIcon />}
						onClick={() => {
							setSearchParams((prev) => {
								prev.delete(FILTERED_TAG_KEY_SEARCH_PARAM_KEY);
								return prev;
							});
						}}
					>
						{t("common:actions.clear")}
					</Button>
				</div>
			) : null}
			<ArtGrid arts={arts} />
		</Main>
	);
}
