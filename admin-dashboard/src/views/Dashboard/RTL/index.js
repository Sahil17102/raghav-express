// Chakra imports
import {
  Flex,
  Grid,
  Image,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
// assets
import peopleImage from "assets/img/people-image.png";
import BarChart from "components/Charts/BarChart";
import LineChart from "components/Charts/LineChart";
// Custom icons
import {
  CartIcon,
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
} from "components/Icons/Icons.js";
import React from "react";
import { rtlDashboardTableData, rtlTimelineData } from "variables/general";
import ActiveUsers from "../Dashboard/components/ActiveUsers";
import BuiltByDevelopers from "../Dashboard/components/BuiltByDevelopers";
import MiniStatistics from "../Dashboard/components/MiniStatistics";
import OrdersOverview from "../Dashboard/components/OrdersOverview";
import Projects from "../Dashboard/components/Projects";
import SalesOverview from "../Dashboard/components/SalesOverview";
import WorkWithTheRockets from "../Dashboard/components/WorkWithTheRockets";
import { BRAND } from "../../../constants/brand";

export default function Dashboard() {
  // Chakra Color Mode

  const iconBoxInside = useColorModeValue("white", "white");

  return (
    <Flex flexDirection='column' pt={{ base: "12px", md: "4px" }}>
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={"Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª"}
          amount={"$53,000"}
          percentage={55}
          icon={<WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Ø¹Ù…Ù„Ø§Ø¡ Ø¬Ø¯Ø¯"}
          amount={"2,300"}
          percentage={5}
          icon={<GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Ù…Ø³ØªØ®Ø¯Ù…Ùˆ Ø§Ù„ÙŠÙˆÙ…"}
          amount={"+3,020"}
          percentage={-14}
          icon={<DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Ø£Ù…ÙˆØ§Ù„ Ø§Ù„ÙŠÙˆÙ…"}
          amount={"$173,000"}
          percentage={8}
          icon={<CartIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
      </SimpleGrid>
      <Grid
        templateColumns={{ md: "1fr", lg: "1.8fr 1.2fr" }}
        templateRows={{ md: "1fr auto", lg: "1fr" }}
        my='26px'
        gap='24px'>
        <BuiltByDevelopers
          title={"ØªÙ… ØªØ·ÙˆÙŠØ±Ù‡Ø§ Ù„Ù„Ø¥Ø¯Ø§Ø±Ø©"}
          name={`Ù„ÙˆØ­Ø© ØªØ­ÙƒÙ… ${BRAND.name}`}
          description={
            "ØªØ¬Ø±Ø¨Ø© Ø¥Ø¯Ø§Ø±Ø© Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø´Ø­Ù†Ø§Øª ÙˆØ§Ù„Ø¯Ø¹Ù… ÙˆØ§Ù„ØªØ³Ø¹ÙŠØ± ÙˆØ§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ù…Ù† Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯."
          }
          image={
            <Image
              src={BRAND.logo}
              alt={BRAND.name}
              minWidth={{ md: "300px", lg: "auto" }}
              borderRadius="20px"
            />
          }
        />
        <WorkWithTheRockets
          backgroundImage={peopleImage}
          title={"Ø§Ù„Ø¹Ù…Ù„ Ø¨Ø³Ø±Ø¹Ø© ÙˆÙˆØ¶ÙˆØ­"}
          description={
            "ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù…ØµÙ…Ù…Ø© Ù„ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ø¶ÙˆØ¶Ø§Ø¡ Ø§Ù„Ø¨ØµØ±ÙŠØ© ÙˆØ¬Ø¹Ù„ Ø§Ù„Ù‚Ø±Ø§Ø±Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ© Ø£Ø³Ø±Ø¹ ÙˆØ£ÙƒØ«Ø± Ø«Ù‚Ø©."
          }
        />
      </Grid>
      <Grid
        templateColumns={{ sm: "1fr", lg: "1.3fr 1.7fr" }}
        templateRows={{ sm: "repeat(2, 1fr)", lg: "1fr" }}
        gap='24px'
        mb={{ lg: "26px" }}>
        <ActiveUsers
          title={"Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ù†Ø´Ø·ÙŠÙ†"}
          percentage={23}
          chart={<BarChart />}
        />
        <SalesOverview
          title={"Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª"}
          percentage={5}
          chart={<LineChart />}
        />
      </Grid>
      <Grid
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        templateRows={{ sm: "1fr auto", md: "1fr", lg: "1fr" }}
        gap='24px'>
        <Projects
          title={"Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹"}
          amount={30}
          captions={["Companies", "Members", "Budget", "Completion"]}
          data={rtlDashboardTableData}
        />
        <OrdersOverview
          title={"Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø·Ù„Ø¨Ø§Øª"}
          amount={30}
          data={rtlTimelineData}
        />
      </Grid>
    </Flex>
  );
}

