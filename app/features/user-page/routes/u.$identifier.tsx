import type { MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { useUser } from "~/features/auth/core/user";
import { metaTags } from "~/utils/remix";
import type { SendouRouteHandle } from "~/utils/remix.server";
import {
	USER_SEARCH_PAGE,
	navIconUrl,
	userArtPage,
	userBuildsPage,
	userEditProfilePage,
	userPage,
	userResultsPage,
	userSeasonsPage,
	userVodsPage,
} from "~/utils/urls";

import {
	type UserPageLoaderData,
	loader,
} from "../loaders/u.$identifier.server";
export { loader };

import "~/styles/u.css";

export const meta: MetaFunction<typeof loader> = (args) => {
	if (!args.data) return [];

	return metaTags({
		title: args.data.user.username,
		description: `${args.data.user.username}'s profile on sendou.ink including builds, tournament results, art and more.`,
		location: args.location,
	});
};

export const handle: SendouRouteHandle = {
	i18n: ["user", "badges"],
	breadcrumb: ({ match }) => {
		const data = match.data as UserPageLoaderData | undefined;

		if (!data) return [];

		return [
			{
				imgPath: navIconUrl("u"),
				href: USER_SEARCH_PAGE,
				type: "IMAGE",
			},
			{
				text: data.user.username,
				href: userPage(data.user),
				type: "TEXT",
			},
		];
	},
};

export default function UserPageLayout() {
	const data = useLoaderData<typeof loader>();
	const user = useUser();
	const location = useLocation();
	const { t } = useTranslation(["common", "user"]);

	const isOwnPage = data.user.id === user?.id;

	const allResultsCount =
		data.user.calendarEventResultsCount + data.user.tournamentResultsCount;

	return (
		<Main bigger={location.pathname.includes("results")}>
			<SubNav>
				<SubNavLink to={userPage(data.user)}>
					{t("common:header.profile")}
				</SubNavLink>
				<SubNavLink to={userSeasonsPage({ user: data.user })}>
					{t("user:seasons")}
				</SubNavLink>
				{isOwnPage && (
					<SubNavLink to={userEditProfilePage(data.user)} prefetch="intent">
						{t("common:actions.edit")}
					</SubNavLink>
				)}
				{allResultsCount > 0 && (
					<SubNavLink to={userResultsPage(data.user)}>
						{t("common:results")} ({allResultsCount})
					</SubNavLink>
				)}
				{data.user.buildsCount > 0 && (
					<SubNavLink
						to={userBuildsPage(data.user)}
						prefetch="intent"
						data-testid="builds-tab"
					>
						{t("common:pages.builds")} ({data.user.buildsCount})
					</SubNavLink>
				)}
				{data.user.vodsCount > 0 && (
					<SubNavLink to={userVodsPage(data.user)}>
						{t("common:pages.vods")} ({data.user.vodsCount})
					</SubNavLink>
				)}
				{data.user.artCount > 0 && (
					<SubNavLink to={userArtPage(data.user)} end={false}>
						{t("common:pages.art")} ({data.user.artCount})
					</SubNavLink>
				)}
			</SubNav>
			<Outlet />
		</Main>
	);
}
