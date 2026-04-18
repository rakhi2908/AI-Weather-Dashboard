import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, SvgIcon, Typography } from '@mui/material';
import Search from './components/Search/Search';
import WeeklyForecast from './components/WeeklyForecast/WeeklyForecast';
import TodayWeather from './components/TodayWeather/TodayWeather';
import { fetchWeatherData } from './api/OpenWeatherService';
import { transformDateFormat } from './utilities/DatetimeUtils';
import UTCDatetime from './components/Reusable/UTCDatetime';
import LoadingBox from './components/Reusable/LoadingBox';
import { ReactComponent as SplashIcon } from './assets/splash-icon.svg';
import ErrorBox from './components/Reusable/ErrorBox';
import { ALL_DESCRIPTIONS } from './utilities/DateConstants';
import {
  getTodayForecastWeather,
  getWeekForecastWeather,
} from './utilities/DataUtils';

function App() {
  const [todayWeather, setTodayWeather] = useState(null);
  const [todayForecast, setTodayForecast] = useState([]);
  const [weekForecast, setWeekForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
  }, []);

  const searchChangeHandler = async (enteredData) => {
    const [latitude, longitude] = enteredData.value.split(' ');
    setIsLoading(true);

    const currentDate = transformDateFormat();
    const date = new Date();
    let dt_now = Math.floor(date.getTime() / 1000);

    try {
      const [todayWeatherResponse, weekForecastResponse] =
        await fetchWeatherData(latitude, longitude);

      const all_today_forecasts_list = getTodayForecastWeather(
        weekForecastResponse,
        currentDate,
        dt_now
      );

      const all_week_forecasts_list = getWeekForecastWeather(
        weekForecastResponse,
        ALL_DESCRIPTIONS
      );

      setTodayForecast([...all_today_forecasts_list]);
      setTodayWeather({ city: enteredData.label, ...todayWeatherResponse });
      setWeekForecast({
        city: enteredData.label,
        list: all_week_forecasts_list,
      });
    } catch (error) {
      setError(true);
    }

    setIsLoading(false);
  };

  let appContent = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ width: '100%', minHeight: '500px' }}
    >
      {/* ✅ Splash Icon KEPT */}
      <SvgIcon
        component={SplashIcon}
        inheritViewBox
        sx={{ fontSize: '120px' }}
      />

      <Typography sx={{ color: 'white', marginTop: '1rem' }}>
        Smart AI Weather Insights
      </Typography>
    </Box>
  );

  if (todayWeather && todayForecast && weekForecast) {
    appContent = (
      <>
        <Grid item xs={12} md={6}>
          <TodayWeather data={todayWeather} forecastList={todayForecast} />
        </Grid>
        <Grid item xs={12} md={6}>
          <WeeklyForecast data={weekForecast} />
        </Grid>
      </>
    );
  }

  if (error) {
    appContent = <ErrorBox errorMessage="Something went wrong" />;
  }

  if (isLoading) {
    appContent = (
      <Box display="flex" justifyContent="center" alignItems="center">
        <LoadingBox>
          <Typography>Loading...</Typography>
        </LoadingBox>
      </Box>
    );
  }

  return (
    <Container sx={{ padding: '1rem' }}>
      <Grid container>

        {/* HEADER (NO LOGO) */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">

            {/* Title only */}
            <Typography
              sx={{
                color: '#ced0d0',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              AI Weather Dashboard
            </Typography>

            {/* Time */}
            <Box>
              <UTCDatetime />
              <Typography sx={{ color: 'white', fontSize: '12px' }}>
                Last Updated: {time}
              </Typography>
            </Box>

          </Box>

          <Search onSearchChange={searchChangeHandler} />
        </Grid>

        {appContent}
      </Grid>
    </Container>
  );
}

export default App;