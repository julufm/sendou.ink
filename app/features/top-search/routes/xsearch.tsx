import type { MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import type { Tables } from "~/db/tables";
import type { RankedModeShort } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import invariant from "~/utils/invariant";
import { metaTags } from "~/utils/remix";
import type { SendouRouteHandle } from "~/utils/remix.server";
import { navIconUrl, topSearchPage } from "~/utils/urls";
import { PlacementsTable } from "../components/Placements";
import type { MonthYear } from "../top-search-utils";

import { loader } from "../loaders/xsearch.server";
export { loader };

import "../top-search.css";

export const handle: SendouRouteHandle = {
	breadcrumb: () => ({
		imgPath: navIconUrl("xsearch"),
		href: topSearchPage(),
		type: "IMAGE",
	}),
};

export const meta: MetaFunction = (args) => {
	return metaTags({
		title: "X Battle Top 500 Placements",
		ogTitle: "Splatoon 3 X Battle Top 500 results browser",
		description:
			"Splatoon 3 X Battle results for the top 500 players for all the finished seasons in both Tentatek and Takoroka divisions.",
		location: args.location,
	});
};

export default function XSearchPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation(["common", "game-misc"]);
	const data = useLoaderData<typeof loader>();

	const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const [month, year, mode, region] = event.target.value.split("-");
		invariant(month, "month is missing");
		invariant(year, "year is missing");
		invariant(mode, "mode is missing");
		invariant(region, "region is missing");

		setSearchParams({
			month,
			year,
			mode,
			region,
		});
	};

	const selectValue = `${
		searchParams.get("month") ?? data.availableMonthYears[0].month
	}-${searchParams.get("year") ?? data.availableMonthYears[0].year}-${
		searchParams.get("mode") ?? "SZ"
	}-${searchParams.get("region") ?? "WEST"}`;

	return (
		<Main halfWidth className="stack lg">
			<select
				className="text-sm"
				onChange={handleSelectChange}
				value={selectValue}
				data-testid="xsearch-select"
			>
				{selectOptions(data.availableMonthYears).map((group) => (
					<optgroup
						key={group[0].id}
						label={t(`common:divisions.${group[0].region}`)}
					>
						{group.map((option) => (
							<option
								key={option.id}
								value={`${option.span.value.month}-${option.span.value.year}-${option.mode}-${option.region}`}
							>
								{option.span.from.month}/{option.span.from.year} -{" "}
								{option.span.to.month}/{option.span.to.year} /{" "}
								{t(`game-misc:MODE_SHORT_${option.mode}`)} /{" "}
								{t(`common:divisions.${option.region}`)}
							</option>
						))}
					</optgroup>
				))}
			</select>
			<PlacementsTable placements={data.placements} />
		</Main>
	);
}

interface SelectOption {
	id: string;
	region: Tables["XRankPlacement"]["region"];
	mode: RankedModeShort;
	span: {
		from: MonthYear;
		to: MonthYear;
		value: MonthYear;
	};
}

function selectOptions(monthYears: MonthYear[]) {
	const options: SelectOption[][] = [];
	for (const monthYear of monthYears) {
		for (const region of ["WEST", "JPN"] as const) {
			const regionOptions: SelectOption[] = [];
			for (const mode of rankedModesShort) {
				regionOptions.push({
					id: nanoid(),
					region,
					mode,
					span: monthYearToSpan(monthYear),
				});
			}

			options.push(regionOptions);
		}
	}

	return options;
}

function monthYearToSpan(monthYear: MonthYear) {
	const date = new Date(monthYear.year, monthYear.month - 1);
	const lastMonth = new Date(date.getFullYear(), date.getMonth(), 0);
	const threeMonthsAgo = new Date(date.getFullYear(), date.getMonth() - 3, 1);

	return {
		from: {
			month: threeMonthsAgo.getMonth() + 1,
			year: threeMonthsAgo.getFullYear(),
		},
		to: {
			month: lastMonth.getMonth() + 1,
			year: lastMonth.getFullYear(),
		},
		value: {
			month: date.getMonth() + 1,
			year: date.getFullYear(),
		},
	};
}
